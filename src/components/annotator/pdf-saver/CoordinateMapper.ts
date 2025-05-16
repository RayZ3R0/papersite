'use client';

import { Point } from "@/lib/annotationStore";
import type { ViewportDimensions } from "./types";

interface PDFDimensions {
  width: number;
  height: number;
}

export interface MappedPoint extends Point {
  pdfX: number;
  pdfY: number;
}

/**
 * Handles coordinate transformation between different coordinate spaces:
 * - Canvas coordinates (browser pixels)
 * - PDF coordinates (points, where 1pt = 1/72 inch)
 */
export default class CoordinateMapper {
  private devicePixelRatio: number;
  private scaleFactorX: number;
  private scaleFactorY: number;

  constructor(
    private viewport: ViewportDimensions,
    private pdfDimensions: PDFDimensions
  ) {
    console.debug('[CoordinateMapper] Initializing', {
      viewport,
      pdfDimensions
    });

    this.devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    // Calculate scale factors once
    this.scaleFactorX = this.pdfDimensions.width / (this.viewport.width / this.viewport.scale);
    this.scaleFactorY = this.pdfDimensions.height / (this.viewport.height / this.viewport.scale);

    console.debug('[CoordinateMapper] Scale factors calculated', {
      devicePixelRatio: this.devicePixelRatio,
      scaleX: this.scaleFactorX,
      scaleY: this.scaleFactorY
    });
  }

  /**
   * Map canvas coordinates to PDF coordinates
   */
  mapPoint(point: Point): MappedPoint {
    try {
      // Convert coordinates
      const pdfX = (point.x / this.devicePixelRatio / this.viewport.scale) * this.scaleFactorX;
      const pdfY = (point.y / this.devicePixelRatio / this.viewport.scale) * this.scaleFactorY;

      const mappedPoint = {
        ...point,
        pdfX,
        pdfY
      };

      console.debug('[CoordinateMapper] Mapped point', {
        original: point,
        mapped: mappedPoint
      });

      return mappedPoint;
    } catch (error) {
      console.error('[CoordinateMapper] Failed to map point:', error);
      throw error;
    }
  }

  /**
   * Map a stroke size to PDF units
   */
  mapStrokeSize(size: number): number {
    try {
      // Use X scale factor for stroke width
      const mappedSize = (size / this.devicePixelRatio / this.viewport.scale) * this.scaleFactorX;

      console.debug('[CoordinateMapper] Mapped stroke size', {
        original: size,
        mapped: mappedSize
      });

      return mappedSize;
    } catch (error) {
      console.error('[CoordinateMapper] Failed to map stroke size:', error);
      throw error;
    }
  }

  /**
   * Get SVG viewBox for PDF page
   */
  getSVGViewBox(): string {
    return `0 0 ${this.pdfDimensions.width} ${this.pdfDimensions.height}`;
  }

  /**
   * Get PDF dimensions
   */
  getPDFDimensions(): PDFDimensions {
    return { ...this.pdfDimensions };
  }

  /**
   * Get current viewport dimensions
   */
  getViewportDimensions(): ViewportDimensions {
    return { ...this.viewport };
  }

  /**
   * Create a properly scaled SVG container
   */
  createSVGContainer(): SVGSVGElement {
    try {
      console.debug('[CoordinateMapper] Creating SVG container');
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', String(this.pdfDimensions.width));
      svg.setAttribute('height', String(this.pdfDimensions.height));
      svg.setAttribute('viewBox', this.getSVGViewBox());
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      // Add metadata about scaling
      svg.dataset.originalWidth = String(this.viewport.width);
      svg.dataset.originalHeight = String(this.viewport.height);
      svg.dataset.scale = String(this.viewport.scale);
      svg.dataset.dpr = String(this.devicePixelRatio);

      return svg;
    } catch (error) {
      console.error('[CoordinateMapper] Failed to create SVG container:', error);
      throw error;
    }
  }

  /**
   * Map a path to PDF coordinates
   */
  mapPath(path: string): string {
    try {
      console.debug('[CoordinateMapper] Mapping path', { length: path.length });

      // Map each coordinate in the path
      const mappedPath = path.replace(/(-?\d*\.?\d+)[ ,](-?\d*\.?\d+)/g, (_, x, y) => {
        const mapped = this.mapPoint({ 
          x: parseFloat(x), 
          y: parseFloat(y), 
          pressure: 0.5 
        });
        return `${mapped.pdfX},${mapped.pdfY}`;
      });

      console.debug('[CoordinateMapper] Path mapped', {
        originalLength: path.length,
        mappedLength: mappedPath.length
      });

      return mappedPath;
    } catch (error) {
      console.error('[CoordinateMapper] Failed to map path:', error);
      throw error;
    }
  }

  /**
   * Validate coordinate mapping
   */
  validate(): boolean {
    try {
      // Check for valid dimensions
      if (this.viewport.width <= 0 || this.viewport.height <= 0 ||
          this.pdfDimensions.width <= 0 || this.pdfDimensions.height <= 0) {
        throw new Error('Invalid dimensions');
      }

      // Check for valid scale factors
      if (this.scaleFactorX <= 0 || this.scaleFactorY <= 0) {
        throw new Error('Invalid scale factors');
      }

      // Test map a point
      const testPoint = this.mapPoint({ x: 100, y: 100, pressure: 0.5 });
      if (isNaN(testPoint.pdfX) || isNaN(testPoint.pdfY)) {
        throw new Error('Invalid coordinate mapping');
      }

      return true;
    } catch (error) {
      console.error('[CoordinateMapper] Validation failed:', error);
      return false;
    }
  }
}