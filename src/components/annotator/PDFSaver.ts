'use client';

import { PDFDocument, PDFEmbeddedPage, PDFPage } from 'pdf-lib';
import { pdfjs } from 'react-pdf';
import { Stroke } from '@/lib/annotationStore';
import StrokeRenderer, { StrokeRendererOptions } from './rendering/StrokeRenderer';
import { RenderOptions } from './rendering/BaseRenderer';

interface SaveProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

export default class PDFSaver {
  constructor(private file: File | Blob) {}

  private async createCanvas(width: number, height: number): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private async getPDFJSDocument(arrayBuffer: ArrayBuffer) {
    return pdfjs.getDocument({ data: arrayBuffer }).promise;
  }

  private async renderPageToCanvas(
    pdfPage: PDFPage,
    annotations: Stroke[],
    options: RenderOptions,
    pdfArrayBuffer: ArrayBuffer,
    pageNumber: number
  ): Promise<HTMLCanvasElement> {
    const { width: pdfWidth, height: pdfHeight } = pdfPage.getSize();
    
    // Create canvas at PDF size
    const canvas = await this.createCanvas(pdfWidth, pdfHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    try {
      // Load the PDF page
      const pdfJSDoc = await this.getPDFJSDocument(pdfArrayBuffer);
      const pdfJSPage = await pdfJSDoc.getPage(pageNumber);

      // Calculate the scale needed to match PDF dimensions
      const baseViewport = pdfJSPage.getViewport({ scale: 1.0 });
      const scale = pdfWidth / baseViewport.width;
      
      // Create a viewport at the correct scale
      const viewport = pdfJSPage.getViewport({ scale });

      // Clear canvas and set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pdfWidth, pdfHeight);

      // Render PDF content
      await pdfJSPage.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      // Draw annotations
      ctx.save();
      ctx.scale(scale, scale); // Scale to match PDF dimensions

      // Set up for high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw each annotation
      annotations.forEach(stroke => {
        const renderer = new StrokeRenderer(stroke, {
          ...options,
          smoothing: true,
          scale // Pass the PDF scale to the renderer
        });

        // Set blending mode
        if (stroke.tool === 'highlighter') {
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = stroke.opacity;
        } else if (stroke.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.globalAlpha = 1;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        }

        // Render stroke with proper scaling
        renderer.render(ctx, {
          ...options,
          scale: 1 / scale // Compensate for the context scaling
        });
      });

      ctx.restore();

      return canvas;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw error;
    }
  }

  private async getArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async save(
    annotations: Map<number, Stroke[]>,
    onProgress?: (progress: SaveProgress) => void
  ): Promise<Blob> {
    try {
      // Load the PDF
      const arrayBuffer = await this.getArrayBuffer(this.file);
      
      // Create a new PDF document to ensure we don't have rendering artifacts
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfDoc = await PDFDocument.create();
      
      // Copy all pages from source to destination
      const pages = sourcePdfDoc.getPages();
      const pageIndices = Array.from({ length: pages.length }, (_, i) => i);
      const copiedPages = await pdfDoc.copyPages(sourcePdfDoc, pageIndices);
      
      // Add each copied page to the new document
      for (let i = 0; i < copiedPages.length; i++) {
        pdfDoc.addPage(copiedPages[i]);
      }
      
      // Now get the pages from the new document
      const newPages = pdfDoc.getPages();
      
      // Process each page
      for (let i = 0; i < newPages.length; i++) {
        const pageNumber = i + 1;
        onProgress?.({
          currentPage: pageNumber,
          totalPages: newPages.length,
          status: `Processing page ${pageNumber}`
        });
  
        // Get the current page
        const page = newPages[i];
        const pageAnnotations = annotations.get(pageNumber) || [];
  
        // If no annotations on this page, skip further processing
        if (pageAnnotations.length === 0) {
          continue;
        }
  
        try {
          // Render the page with annotations to canvas
          const canvas = await this.renderPageToCanvas(
            pages[i], // Use the original page for rendering to ensure correct scale
            pageAnnotations,
            { scale: 1 }, 
            arrayBuffer, 
            pageNumber
          );
          
          // Convert canvas to PNG with high quality
          const imageBytes = await new Promise<Uint8Array>((resolve, reject) => {
            canvas.toBlob(async blob => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }
              
              try {
                const arrayBuffer = await blob.arrayBuffer();
                resolve(new Uint8Array(arrayBuffer));
              } catch (error) {
                reject(error);
              }
            }, 'image/png', 1.0); // Use max quality
          });
    
          // Embed image in PDF
          const { width, height } = page.getSize();
          const image = await pdfDoc.embedPng(imageBytes);
          
          // Replace the page with the annotated image
          // First clear the page (create a new empty page with same size)
          const newPage = pdfDoc.insertPage(i, [width, height]);
          pdfDoc.removePage(i + 1); // Remove the original page
          
          // Draw the image exactly matching the page dimensions
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
            opacity: 1
          });
        } catch (error) {
          console.error(`Error processing page ${pageNumber}:`, error);
          onProgress?.({
            currentPage: pageNumber,
            totalPages: newPages.length,
            status: `Error on page ${pageNumber}, using original content`
          });
        }
      }
  
      onProgress?.({
        currentPage: newPages.length,
        totalPages: newPages.length,
        status: 'Finalizing PDF'
      });
  
      // Create final PDF with compression options for better quality
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,  // May help with compatibility
        addDefaultPage: false
      });
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Failed to save PDF:', error);
      throw error;
    }
  }

  // Helper method to trigger download
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
