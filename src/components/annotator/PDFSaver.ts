'use client';

import { PDFDocument, PDFPage } from 'pdf-lib';
import { pdfjs } from 'react-pdf';
import { Stroke } from '@/lib/annotationStore';
import StrokeRenderer from './rendering/StrokeRenderer';
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
    const { width, height } = pdfPage.getSize();
    
    // Create canvas at PDF size
    const canvas = await this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    try {
      // Load PDF document with pdf.js
      const pdfJSDoc = await this.getPDFJSDocument(pdfArrayBuffer);
      const pdfJSPage = await pdfJSDoc.getPage(pageNumber);

      // Set up viewport and render
      const viewport = pdfJSPage.getViewport({ scale: 1.0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the PDF page
      await pdfJSPage.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      // Calculate the scale to match target dimensions while preserving aspect ratio
      const scale = Math.min(width / viewport.width, height / viewport.height);
      
      // Update canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Center the content
      const offsetX = (width - viewport.width * scale) / 2;
      const offsetY = (height - viewport.height * scale) / 2;
      
      // Draw PDF
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      
      await pdfJSPage.render({
        canvasContext: ctx,
        viewport,
      }).promise;
      
      // Draw annotations using the same transform
      annotations.forEach(stroke => {
        const renderer = new StrokeRenderer(stroke, {
          ...options,
          smoothing: true,
        });
        renderer.render(ctx, {
          ...options,
          scale: options.scale || 1,
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
    // Load the PDF
    const arrayBuffer = await this.getArrayBuffer(this.file);
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const scale = 2; // Higher resolution for better quality

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const pageNumber = i + 1;
      onProgress?.({
        currentPage: pageNumber,
        totalPages: pages.length,
        status: `Processing page ${pageNumber}`
      });

      const page = pages[i];
      const pageAnnotations = annotations.get(pageNumber) || [];

      if (pageAnnotations.length > 0) {
        // Render annotations to canvas
        const canvas = await this.renderPageToCanvas(page, pageAnnotations, { scale }, arrayBuffer, pageNumber);
        
        // Convert canvas to image
        const imageBytes = await new Promise<Uint8Array>((resolve, reject) => {
          canvas.toBlob(async blob => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }
            const arrayBuffer = await blob.arrayBuffer();
            resolve(new Uint8Array(arrayBuffer));
          }, 'image/png');
        });

        // Embed image in PDF
        const image = await pdfDoc.embedPng(imageBytes);
        const { width, height } = page.getSize();
        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
          opacity: 1
        });
      }
    }

    onProgress?.({
      currentPage: pages.length,
      totalPages: pages.length,
      status: 'Finalizing PDF'
    });

    // Create final PDF
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
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
