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

  private async renderStrokesToCanvas(
    strokes: Stroke[],
    pdfWidth: number,
    pdfHeight: number,
    viewportWidth: number,
    viewportHeight: number
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

        // Calculate scale factor from viewport to PDF coordinates
        const scaleX = pdfWidth / viewportWidth;
        const scaleY = pdfHeight / viewportHeight;

        this.logWithTime('Rendering strokes', {
          pdfDimensions: { width: pdfWidth, height: pdfHeight },
          viewportDimensions: { width: viewportWidth, height: viewportHeight },
          scale: { x: scaleX, y: scaleY }
        });

        // Draw each stroke
        for (const stroke of strokes) {
          const renderer = new StrokeRenderer(stroke, {
            scale: 1,
            smoothing: true,
            forExport: true
          });

          // Scale stroke size proportionally
          const scaledStroke = {
            ...stroke,
            size: stroke.size * scaleX
          };

          // Transform context for this stroke
          ctx.save();
          
          // Scale coordinates from viewport to PDF space
          ctx.scale(scaleX, scaleY);
          
          // Render the stroke
          renderer.render(ctx, { scale: 1 });
          
          // Restore context
          ctx.restore();
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

      // Calculate viewport dimensions (assume all pages have same viewport)
      // These should match the dimensions used in the viewer
      const viewportWidth = 800; // Default viewport width
      const viewportHeight = 1132; // Default viewport height (A4 ratio)

      this.logWithTime('Processing PDF', {
        pages: pages.length,
        viewport: { width: viewportWidth, height: viewportHeight }
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
          // Render strokes to image
          const pngData = await this.renderStrokesToCanvas(
            strokes,
            pdfWidth,
            pdfHeight,
            viewportWidth,
            viewportHeight
          );

          // Embed image in PDF
          const image = await pdfDoc.embedPng(pngData);

          // Draw image at exact page dimensions
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: pdfWidth,
            height: pdfHeight
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
