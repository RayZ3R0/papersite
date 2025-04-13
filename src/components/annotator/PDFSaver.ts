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
const PDF_POINTS_PER_INCH = 72;
const SCREEN_PIXELS_PER_INCH = 96;

// Coordinate system adjustment constants
const DPI_RATIO = PDF_POINTS_PER_INCH / SCREEN_PIXELS_PER_INCH;

// Manual fine-tuning adjustments (can be modified for better alignment)
const MANUAL_FINE_TUNING = {
  offsetX: 0,        // Horizontal adjustment in pixels (positive = right)
  offsetY: 0,        // Vertical adjustment in pixels (positive = down)
  scaleAdjustment: 1.0,  // Scale factor adjustment (1.0 = no change)
  rotationDegrees: 0    // Rotation in degrees (rarely needed)
};

export default class PDFSaver {
  private logWithTime(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`[PDFSaver ${timestamp}] ${message}`, data || '');
  }

  constructor(
    private file: File | Blob, 
    private viewerScale: number = 1.0,
    private manualTuning = MANUAL_FINE_TUNING
  ) {}

  /**
   * Captures page offsets from the DOM if available
   * These are used to fine-tune the annotation placement
   */
  private getPageOffsets(): { offsetX: number, offsetY: number, pageScale: number } {
    try {
      // Try to get the current canvas element and annotation container
      const pdfCanvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      const annotationLayer = document.querySelector('.react-pdf__Page') as HTMLDivElement;
      
      if (pdfCanvas && annotationLayer) {
        const pdfRect = pdfCanvas.getBoundingClientRect();
        const annotationRect = annotationLayer.getBoundingClientRect();
        
        // Calculate offsets between the PDF canvas and annotation layer
        const offsetX = pdfRect.left - annotationRect.left;
        const offsetY = pdfRect.top - annotationRect.top;
        
        // Determine the effective page scale from DOM elements
        const pageScale = pdfRect.width / pdfCanvas.width;
        
        return { 
          offsetX: offsetX + this.manualTuning.offsetX, 
          offsetY: offsetY + this.manualTuning.offsetY, 
          pageScale 
        };
      }
    } catch (err) {
      // If anything goes wrong, just use default values
      this.logWithTime("Couldn't determine page offsets from DOM", err);
    }
    
    // Default values if DOM elements aren't available
    return { 
      offsetX: this.manualTuning.offsetX, 
      offsetY: this.manualTuning.offsetY, 
      pageScale: 1.0 * this.manualTuning.scaleAdjustment
    };
  }

  private async renderStrokesToCanvas(
    strokes: Stroke[],
    pdfWidth: number,
    pdfHeight: number,
    pageNumber: number
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      try {
        // Create high-resolution canvas matching PDF dimensions
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
        
        // Calculate scale factors between screen space and PDF space
        const screenToPdfRatioX = QUALITY_SCALE * this.manualTuning.scaleAdjustment;
        const screenToPdfRatioY = QUALITY_SCALE * this.manualTuning.scaleAdjustment;
        
        // Get fine-tuning offsets from DOM if available
        const { offsetX, offsetY } = this.getPageOffsets();
        
        // Use a fixed stroke size multiplier based on DPI ratio
        const strokeSizeMultiplier = DPI_RATIO * QUALITY_SCALE * this.manualTuning.scaleAdjustment;
  
        this.logWithTime(`PDF coordinate mapping for page ${pageNumber}`, {
          viewerScale: this.viewerScale,
          pdf: { width: pdfWidth, height: pdfHeight },
          canvas: { width: canvas.width, height: canvas.height },
          offsets: { x: offsetX, y: offsetY },
          manualTuning: this.manualTuning,
          strokeSizeMultiplier,
          quality: QUALITY_SCALE
        });
        
        // Apply rotation if specified (rare, but helpful in some cases)
        if (this.manualTuning.rotationDegrees !== 0) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(this.manualTuning.rotationDegrees * Math.PI / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }
        
        // Separate pen and eraser strokes
        const penStrokes = strokes.filter(stroke => stroke.tool !== 'eraser');
        const eraserStrokes = strokes.filter(stroke => stroke.tool === 'eraser');
        
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
            // Map stroke coordinates to PDF space using the correct transformation
            const scaledStroke = {
              ...stroke,
              points: stroke.points.map(point => {
                // Account for any fine-tuning offsets between PDF and annotation layer
                const adjustedX = point.x + offsetX;
                const adjustedY = point.y + offsetY;
                
                // Scale coordinates using viewerScale and apply PDF transformation
                const pdfX = (adjustedX / this.viewerScale) * screenToPdfRatioX;
                const pdfY = (adjustedY / this.viewerScale) * screenToPdfRatioY;
                
                return {
                  ...point,
                  x: pdfX,
                  y: pdfY
                };
              }),
              // Scale stroke size to match PDF resolution
              size: (stroke.size / this.viewerScale) * strokeSizeMultiplier
            };
    
            // Log first few strokes for debugging
            if (penStrokes.indexOf(stroke) < 2) {
              this.logWithTime(`Pen stroke ${penStrokes.indexOf(stroke)} on page ${pageNumber}`, {
                tool: stroke.tool,
                color: stroke.color,
                size: stroke.size,
                scaledSize: scaledStroke.size,
                viewerScale: this.viewerScale,
                points: stroke.points.length,
                firstPoint: {
                  original: { x: stroke.points[0]?.x, y: stroke.points[0]?.y },
                  adjusted: { x: stroke.points[0]?.x + offsetX, y: stroke.points[0]?.y + offsetY },
                  transformed: { 
                    x: ((stroke.points[0]?.x + offsetX) / this.viewerScale) * screenToPdfRatioX,
                    y: ((stroke.points[0]?.y + offsetY) / this.viewerScale) * screenToPdfRatioY
                  }
                },
                lastPoint: {
                  original: { 
                    x: stroke.points[stroke.points.length-1]?.x, 
                    y: stroke.points[stroke.points.length-1]?.y 
                  },
                  transformed: { 
                    x: ((stroke.points[stroke.points.length-1]?.x + offsetX) / this.viewerScale) * screenToPdfRatioX,
                    y: ((stroke.points[stroke.points.length-1]?.y + offsetY) / this.viewerScale) * screenToPdfRatioY
                  }
                }
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
            this.logWithTime(`Error rendering pen stroke on page ${pageNumber}:`, err);
          }
        }
        
        // Handle eraser strokes with the same coordinate mapping
        if (eraserStrokes.length > 0) {
          ctx.globalCompositeOperation = 'destination-out';
          
          for (const stroke of eraserStrokes) {
            try {
              const scaledStroke = {
                ...stroke,
                points: stroke.points.map(point => {
                  const adjustedX = point.x + offsetX;
                  const adjustedY = point.y + offsetY;
                  
                  const pdfX = (adjustedX / this.viewerScale) * screenToPdfRatioX;
                  const pdfY = (adjustedY / this.viewerScale) * screenToPdfRatioY;
                  
                  return {
                    ...point,
                    x: pdfX,
                    y: pdfY
                  };
                }),
                // Make eraser slightly larger for better coverage
                size: (stroke.size / this.viewerScale) * strokeSizeMultiplier * 1.05
              };
  
              const renderer = new StrokeRenderer(scaledStroke, {
                scale: 1,
                smoothing: true,
                forExport: true,
                enhancedSmoothing: true
              });
  
              renderer.render(ctx, { scale: 1 });
            } catch (err) {
              this.logWithTime(`Error rendering eraser stroke on page ${pageNumber}:`, err);
            }
          }
          
          ctx.globalCompositeOperation = 'source-over';
        }
    
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
        devicePixelRatio: window.devicePixelRatio,
        qualityScale: QUALITY_SCALE,
        annotatedPages: annotations.size,
        viewerScale: this.viewerScale,
        manualTuning: this.manualTuning
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
        if (!page) {
          this.logWithTime(`Page ${pageNum} not found in PDF document`);
          continue;
        }
        
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        try {
          // Log page info
          this.logWithTime(`Processing page ${pageNum}`, {
            dimensions: { width: pdfWidth, height: pdfHeight, ratio: pdfWidth/pdfHeight },
            strokeCount: strokes.length,
            firstStroke: strokes[0]?.points.slice(0, 2),
            strokeTypes: strokes.map(s => s.tool).reduce((acc, tool) => {
              acc[tool] = (acc[tool] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          });

          // Render strokes to image
          const pngData = await this.renderStrokesToCanvas(
            strokes,
            pdfWidth,
            pdfHeight,
            pageNum
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
  
  /**
   * Helper method to create a PDFSaver with custom fine-tuning
   */
  static withCustomTuning(
    file: File | Blob,
    viewerScale: number = 1.0,
    tuning: Partial<typeof MANUAL_FINE_TUNING> = {}
  ): PDFSaver {
    return new PDFSaver(file, viewerScale, {
      ...MANUAL_FINE_TUNING,
      ...tuning
    });
  }
}