'use client';

import { PDFDocument, PDFPage } from 'pdf-lib';
import { Stroke } from '@/lib/annotationStore';
import CoordinateMapper from './CoordinateMapper';
import SVGGenerator from './SVGGenerator';

export interface PDFModifierOptions {
  // Original PDF bytes
  pdfBytes: ArrayBuffer;
  // Mapping of page numbers to strokes
  annotations: Map<number, Stroke[]>;
  // Optional progress callback
  onProgress?: (current: number, total: number, status: string) => void;
}

export interface PageDimensions {
  width: number;
  height: number;
}

/**
 * Handles the PDF modification process to add annotations
 */
export default class PDFModifier {
  private pdfDoc: PDFDocument | null = null;
  private dimensions: Map<number, PageDimensions> = new Map();

  constructor(private options: PDFModifierOptions) {}

  /**
   * Initialize the PDF document and get page dimensions
   */
  private async initialize(): Promise<void> {
    // Load the PDF document
    this.pdfDoc = await PDFDocument.load(this.options.pdfBytes);

    // Get dimensions for all pages
    const pages = this.pdfDoc.getPages();
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      this.dimensions.set(index + 1, { width, height });
    });
  }

  /**
   * Process a single page by adding its annotations
   */
  private async processPage(
    pageNumber: number,
    strokes: Stroke[],
    pdfPage: PDFPage
  ): Promise<void> {
    if (!this.pdfDoc) return;

    const dimensions = this.dimensions.get(pageNumber);
    if (!dimensions) return;

    // Create coordinate mapper for this page
    const mapper = new CoordinateMapper(
      {
        width: dimensions.width,
        height: dimensions.height,
        scale: 1
      },
      dimensions
    );

    // Generate SVG for the annotations
    const svgGenerator = new SVGGenerator(mapper, {
      width: dimensions.width,
      height: dimensions.height,
      optimizePaths: true,
      preservePressure: true
    });

    try {
      // Generate SVG content
      const svgContent = svgGenerator.generateSVG(strokes);

      // Convert SVG to PNG (since pdf-lib doesn't support SVG directly)
      const dataUrl = await this.svgToPng(svgContent, dimensions);
      
      // Convert data URL to bytes
      const imageBytes = await this.dataUrlToBytes(dataUrl);

      // Embed image in PDF
      const image = await this.pdfDoc.embedPng(imageBytes);

      // Draw the image on the page
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
        opacity: 1
      });
    } finally {
      svgGenerator.dispose();
    }
  }

  /**
   * Convert SVG to PNG using canvas
   */
  private async svgToPng(
    svgContent: string,
    dimensions: PageDimensions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to match PDF dimensions
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Create SVG blob
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      // Load SVG into image
      const img = new Image();
      img.onload = () => {
        try {
          // Clear canvas and draw image
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      img.src = url;
    });
  }

  /**
   * Convert data URL to bytes
   */
  private async dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new Uint8Array(await blob.arrayBuffer());
  }

  /**
   * Process all pages and generate the final PDF
   */
  async process(): Promise<Uint8Array> {
    try {
      await this.initialize();
      if (!this.pdfDoc) {
        throw new Error('PDF document not initialized');
      }

      const pages = this.pdfDoc.getPages();
      const total = pages.length;

      // Process each page
      for (let i = 0; i < total; i++) {
        const pageNumber = i + 1;
        const strokes = this.options.annotations.get(pageNumber) || [];

        this.options.onProgress?.(
          pageNumber,
          total,
          `Processing page ${pageNumber} of ${total}`
        );

        if (strokes.length > 0) {
          await this.processPage(pageNumber, strokes, pages[i]);
        }
      }

      this.options.onProgress?.(total, total, 'Finalizing PDF...');

      // Save the modified PDF
      return await this.pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }
}