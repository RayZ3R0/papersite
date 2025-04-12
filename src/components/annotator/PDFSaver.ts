'use client';

import { Stroke } from '@/lib/annotationStore';
import StrokeRenderer from './rendering/StrokeRenderer';
import { PDFDocument } from 'pdf-lib';
import { PDFSaveError, PDFSaveErrorCode } from './pdf-saver/types';

interface SaveProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

// Constants for coordinate conversion
const QUALITY_SCALE = 4; // Increase rendering quality
const PDF_TO_SCREEN_RATIO = 72 / 96; // PDF points to screen pixels ratio

export default class PDFSaver {
  private logWithTime(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[PDFSaver ${timestamp}] ${message}`, data || '');
  }

  constructor(private file: File | Blob) {}

  private getViewportDimensions() {
    const viewer = document.querySelector('.react-pdf__Page');
    if (!viewer) return null;
    const rect = viewer.getBoundingClientRect();
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
        // Create high-resolution canvas
        const canvas = document.createElement('canvas');
        canvas.width = pdfWidth * QUALITY_SCALE;
        canvas.height = pdfHeight * QUALITY_SCALE;
  
        const ctx = canvas.getContext('2d', {
          alpha: true,
          willReadFrequently: true
        });
  
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
  
        // Get viewport dimensions
        const viewport = this.getViewportDimensions();
        if (!viewport) {
          throw new Error('Could not get viewport dimensions');
        }
  
        // Calculate scale factors
        const scaleX = (pdfWidth / viewport.width) * QUALITY_SCALE;
        const scaleY = (pdfHeight / viewport.height) * QUALITY_SCALE;
        const strokeScale = Math.min(scaleX, scaleY) * PDF_TO_SCREEN_RATIO;
  
        this.logWithTime('Canvas setup', {
          pdf: { width: pdfWidth, height: pdfHeight },
          canvas: { width: canvas.width, height: canvas.height },
          viewport,
          scale: { x: scaleX, y: scaleY, stroke: strokeScale }
        });
        
        // Separate pen and eraser strokes
        const penStrokes = strokes.filter(stroke => stroke.tool !== 'eraser');
        const eraserStrokes = strokes.filter(stroke => stroke.tool === 'eraser');
        
        this.logWithTime('Stroke breakdown', {
          total: strokes.length,
          pen: penStrokes.length,
          eraser: eraserStrokes.length
        });
  
        ctx.save();
        
        // Enhanced image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Apply anti-aliasing
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.miterLimit = 2;
        
        // Draw pen strokes first
        for (const stroke of penStrokes) {
          try {
            // Scale coordinates with enhanced precision
            const scaledStroke = {
              ...stroke,
              points: stroke.points.map(point => ({
                ...point,
                x: point.x * scaleX,
                y: point.y * scaleY
              })),
              // Add a slight increase to stroke size for better visibility
              size: stroke.size * strokeScale * 1.05  // 5% boost in stroke width
            };
  
            // Log stroke data for first few strokes
            if (penStrokes.indexOf(stroke) < 3) {
              this.logWithTime(`Pen stroke ${penStrokes.indexOf(stroke)}`, {
                tool: stroke.tool,
                color: stroke.color,
                size: stroke.size,
                points: stroke.points.length
              });
            }
  
            const renderer = new StrokeRenderer(scaledStroke, {
              scale: 1,
              smoothing: true,
              forExport: true,
              enhancedSmoothing: true
            });
  
            renderer.render(ctx, { scale: 1 });
          } catch (err) {
            this.logWithTime('Error rendering pen stroke:', err);
          }
        }
        
        // Now apply eraser strokes using destination-out blend mode
        if (eraserStrokes.length > 0) {
          // Change composite operation for erasers
          ctx.globalCompositeOperation = 'destination-out';
          
          for (const stroke of eraserStrokes) {
            try {
              // Scale coordinates with enhanced precision
              const scaledStroke = {
                ...stroke,
                points: stroke.points.map(point => ({
                  ...point,
                  x: point.x * scaleX,
                  y: point.y * scaleY
                })),
                // Make eraser slightly larger for better coverage
                size: stroke.size * strokeScale * 1.1  // 10% boost in eraser width
              };
  
              // Log eraser stroke data
              if (eraserStrokes.indexOf(stroke) < 3) {
                this.logWithTime(`Eraser stroke ${eraserStrokes.indexOf(stroke)}`, {
                  tool: stroke.tool,
                  size: stroke.size,
                  points: stroke.points.length
                });
              }
  
              const renderer = new StrokeRenderer(scaledStroke, {
                scale: 1,
                smoothing: true,
                forExport: true,
                enhancedSmoothing: true
              });
  
              renderer.render(ctx, { scale: 1 });
            } catch (err) {
              this.logWithTime('Error rendering eraser stroke:', err);
            }
          }
          
          // Reset composite operation back to default
          ctx.globalCompositeOperation = 'source-over';
        }
  
        // Restore canvas context
        ctx.restore();
  
        // Use uncompressed PNG for maximum quality
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }
  
          blob.arrayBuffer()
            .then(buffer => resolve(new Uint8Array(buffer)))
            .catch(reject);
  
        }, 'image/png', 1.0);  // Use maximum quality setting
  
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
        devicePixelRatio: window.devicePixelRatio,
        qualityScale: QUALITY_SCALE
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
            dimensions: { width: pdfWidth, height: pdfHeight },
            strokeCount: strokes.length,
            firstStroke: strokes[0]?.points.slice(0, 2)
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