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

  private getViewportDimensions(): { width: number; height: number } | null {
    const page = document.querySelector('.react-pdf__Page');
    if (!page) return null;

    const rect = page.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  }

  private async renderStrokesToCanvas(
    strokes: Stroke[],
    pdfWidth: number,
    pdfHeight: number
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      try {
        // Get viewport dimensions
        const viewport = this.getViewportDimensions();
        if (!viewport) {
          throw new Error('Could not determine viewport dimensions');
        }

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

        // Calculate scales
        const scaleX = pdfWidth / viewport.width;
        const scaleY = pdfHeight / viewport.height;

        this.logWithTime('Canvas setup', {
          pdf: { width: pdfWidth, height: pdfHeight },
          viewport,
          scale: { x: scaleX, y: scaleY }
        });

        // Draw each stroke
        for (const stroke of strokes) {
          try {
            // Scale stroke coordinates
            const scaledStroke = {
              ...stroke,
              points: stroke.points.map(point => ({
                ...point,
                x: point.x * scaleX,
                y: point.y * scaleY
              })),
              size: stroke.size * Math.min(scaleX, scaleY) // Scale stroke width proportionally
            };

            this.logWithTime('Stroke scaling', {
              original: {
                first: { x: stroke.points[0].x, y: stroke.points[0].y },
                size: stroke.size
              },
              scaled: {
                first: { x: scaledStroke.points[0].x, y: scaledStroke.points[0].y },
                size: scaledStroke.size
              }
            });

            const renderer = new StrokeRenderer(scaledStroke, {
              scale: 1,
              smoothing: true,
              forExport: true
            });

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

      // Get viewport dimensions
      const viewport = this.getViewportDimensions();
      this.logWithTime('Processing PDF', {
        pages: pages.length,
        viewport,
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
          // Log page info
          this.logWithTime(`Processing page ${pageNum}`, {
            pdf: { width: pdfWidth, height: pdfHeight },
            viewport,
            strokeCount: strokes.length
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
