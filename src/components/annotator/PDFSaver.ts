'use client';

import { Stroke } from '@/lib/annotationStore';
import StrokeRenderer from './rendering/StrokeRenderer';
import { PDFDocument } from 'pdf-lib';
import { PDFSaveError, PDFSaveErrorCode } from './pdf-saver/types';
import { getErrorMessage } from './pdf-saver/utils/error-handling';

interface SaveProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

export default class PDFSaver {
  private logWithTime(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[PDFSaver ${timestamp}] ${message}`, data || '');
  }

  constructor(private file: File | Blob) {}

  private getScalingFactors(pdfWidth: number, pdfHeight: number): { scaleX: number; scaleY: number } {
    // Find the PDF viewer element
    const pdfViewer = document.querySelector('.pdf-viewer') as HTMLElement;
    let viewerWidth = 0;
    let viewerHeight = 0;

    if (pdfViewer) {
      viewerWidth = pdfViewer.clientWidth;
      viewerHeight = pdfViewer.clientHeight;
    } else {
      // Fallback to default A4 ratio if viewer not found
      viewerWidth = 595; // A4 width in points
      viewerHeight = 842; // A4 height in points
    }

    // Calculate scale factors
    const scaleX = pdfWidth / viewerWidth;
    const scaleY = pdfHeight / viewerHeight;

    return { scaleX, scaleY };
  }

  private async renderStrokesToCanvas(
    strokes: Stroke[],
    pdfWidth: number,
    pdfHeight: number
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas at PDF dimensions
        const canvas = document.createElement('canvas');
        canvas.width = pdfWidth;
        canvas.height = pdfHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get scaling factors
        const { scaleX, scaleY } = this.getScalingFactors(pdfWidth, pdfHeight);
        
        this.logWithTime('Rendering strokes', {
          pdfDimensions: { width: pdfWidth, height: pdfHeight },
          scale: { x: scaleX, y: scaleY }
        });

        // Draw each stroke
        for (const stroke of strokes) {
          try {
            // Scale the stroke
            const scaledStroke = {
              ...stroke,
              points: stroke.points.map(point => ({
                ...point,
                x: point.x * scaleX,
                y: pdfHeight - (point.y * scaleY) // Flip Y coordinate
              })),
              size: stroke.size * Math.min(scaleX, scaleY) * 0.5 // Adjust stroke width scaling
            };

            this.logWithTime('Processing stroke', {
              original: {
                x: stroke.points[0].x,
                y: stroke.points[0].y,
                size: stroke.size
              },
              scaled: {
                x: scaledStroke.points[0].x,
                y: scaledStroke.points[0].y,
                size: scaledStroke.size
              }
            });

            const renderer = new StrokeRenderer(scaledStroke, {
              scale: 1,
              smoothing: true,
              forExport: true
            });

            // Render the stroke
            renderer.render(ctx, { scale: 1 });
          } catch (err) {
            this.logWithTime('Error rendering stroke:', err);
          }
        }

        // Convert to PNG
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }

          blob.arrayBuffer()
            .then(buffer => resolve(new Uint8Array(buffer)))
            .catch(reject);

        }, 'image/png', 1.0);

      } catch (error) {
        reject(error);
      }
    });
  }

  async save(
    annotations: Map<number, Stroke[]>,
    onProgress?: (progress: SaveProgress) => void
  ): Promise<Blob> {
    try {
      // Initial progress report
      onProgress?.({
        currentPage: 0,
        totalPages: annotations.size,
        status: 'Loading PDF...'
      });

      // Get PDF bytes
      const pdfBytes = await this.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      this.logWithTime('Processing PDF', {
        pages: pages.length,
        devicePixelRatio: window.devicePixelRatio
      });

      // Process each page
      let currentPage = 0;
      for (const [pageNum, strokes] of annotations.entries()) {
        if (strokes.length === 0) continue;

        currentPage++;
        onProgress?.({
          currentPage,
          totalPages: annotations.size,
          status: `Processing page ${pageNum}...`
        });

        const page = pages[pageNum - 1];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        try {
          // Log page info for debugging
          this.logWithTime(`Page ${pageNum}`, {
            size: { width: pdfWidth, height: pdfHeight },
            rotation: page.getRotation().angle,
            strokeCount: strokes.length,
            strokeBounds: strokes.length > 0 ? {
              minX: Math.min(...strokes.flatMap(s => s.points.map(p => p.x))),
              maxX: Math.max(...strokes.flatMap(s => s.points.map(p => p.x))),
              minY: Math.min(...strokes.flatMap(s => s.points.map(p => p.y))),
              maxY: Math.max(...strokes.flatMap(s => s.points.map(p => p.y)))
            } : null
          });

          // Render strokes to image
          const pngData = await this.renderStrokesToCanvas(
            strokes,
            pdfWidth,
            pdfHeight
          );

          // Embed image in PDF
          const image = await pdfDoc.embedPng(pngData);

          // Draw image at exact page dimensions
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: pdfWidth,
            height: pdfHeight,
            opacity: 1
          });

        } catch (error) {
          this.logWithTime(`Error processing page ${pageNum}:`, error);
          throw error;
        }
      }

      // Save the modified PDF
      onProgress?.({
        currentPage: annotations.size,
        totalPages: annotations.size,
        status: 'Finalizing PDF...'
      });

      const modifiedPdfBytes = await pdfDoc.save();
      return new Blob([modifiedPdfBytes], { type: 'application/pdf' });

    } catch (error) {
      this.logWithTime('PDF save error:', error);
      throw error instanceof PDFSaveError ? error : new PDFSaveError(
        PDFSaveErrorCode.PDF_MODIFICATION_FAILED,
        error instanceof Error ? error.message : 'Failed to save PDF'
      );
    }
  }

  /**
   * Helper method to trigger download
   */
  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
