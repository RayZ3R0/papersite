'use client';

import BaseRenderer, { RenderOptions } from './BaseRenderer';
import { Point, Stroke } from '@/lib/annotationStore';

export interface StrokeRendererOptions extends RenderOptions {
  smoothing?: boolean;
  forExport?: boolean;
}

export default class StrokeRenderer extends BaseRenderer {
  private stroke: Stroke;
  private bounds: { x: number; y: number; width: number; height: number };
  // Changed from private to protected to match parent class
  protected options: StrokeRendererOptions;

  constructor(stroke: Stroke, options: StrokeRendererOptions = { scale: 1 }) {
    super(options);
    this.stroke = stroke;
    this.options = options;
    this.bounds = this.calculateBounds();
  }

  getBounds() {
    return this.bounds;
  }

  private calculateBounds() {
    const points = this.stroke.points;
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    // Add padding for stroke width
    const padding = this.stroke.size / 2;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    };
  }

  /**
   * Get the adjusted stroke width based on pressure
   */
  protected getPressureWidth(baseWidth: number, pressure: number = 0.5): number {
    // Min pressure is 0.5, max is 1.0 for most devices
    // Adjust this range to make pressure more impactful
    const adjustedPressure = Math.max(0.5, Math.min(1.0, pressure));
    
    // Scale the width based on pressure - more pressure = slightly wider line
    // We use a more subtle effect with not too much variation
    return baseWidth * (0.8 + (adjustedPressure * 0.4));
  }

  /**
   * Draw a smooth line with variable width based on pressure
   */
  private drawSmoothLine(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // For each point, calculate control points for curved path
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      const width = this.getPressureWidth(this.stroke.size, points[i].pressure);
      
      ctx.lineWidth = width;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    // Handle last two points
    if (points.length > 2) {
      const last = points.length - 1;
      const width = this.getPressureWidth(this.stroke.size, points[last - 1].pressure);
      
      ctx.lineWidth = width;
      ctx.quadraticCurveTo(
        points[last - 1].x,
        points[last - 1].y,
        points[last].x,
        points[last].y
      );
    } else {
      const width = this.getPressureWidth(this.stroke.size, points[1].pressure);
      ctx.lineWidth = width;
      ctx.lineTo(points[1].x, points[1].y);
    }

    ctx.stroke();
  }

  /**
   * Draw a line with dots at each point for debugging or special effects
   */
  private drawDottedLine(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length === 0) return;

    // Draw dots at each point
    points.forEach(point => {
      ctx.beginPath();
      const width = this.getPressureWidth(this.stroke.size, point.pressure);
      const radius = width / 2;
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Render the stroke to a canvas context
   */
  render(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
    this.setupContext(ctx, options);
    
    if (!this.context) return;
    const context = this.context;

    // Setup stroke style
    context.strokeStyle = this.stroke.color;
    context.globalAlpha = this.stroke.opacity;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // Only set composite operation when not exporting
    // This prevents issues with PDF export and let's the PDFSaver handle it
    const strokeOptions = this.options as StrokeRendererOptions;
    if (!strokeOptions.forExport) {
      if (this.stroke.tool === 'highlighter') {
        context.globalCompositeOperation = 'multiply';
      } else if (this.stroke.tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
      }
    }

    // Apply any special rendering for export
    if (strokeOptions.forExport) {
      // For export, we might want to adjust opacity or other properties
      if (this.stroke.tool === 'highlighter') {
        // Highlighter may need opacity adjustment for PDF export
        context.globalAlpha = Math.min(0.8, this.stroke.opacity * 1.5);
      }
    }

    // Draw the stroke
    if (strokeOptions.smoothing !== false) {
      this.drawSmoothLine(context, this.stroke.points);
    } else {
      // Simple line drawing for performance if needed
      context.beginPath();
      
      if (this.stroke.points.length > 0) {
        context.moveTo(this.stroke.points[0].x, this.stroke.points[0].y);
        
        this.stroke.points.forEach((point, i) => {
          if (i === 0) return; // Skip first point as we already moved to it
          
          const width = this.getPressureWidth(this.stroke.size, point.pressure);
          context.lineWidth = width;
          context.lineTo(point.x, point.y);
        });
        
        context.stroke();
      }
    }

    this.restoreContext();
  }

  /**
   * Generate SVG path for vector export
   */
  toVectorPath(): string {
    const points = this.stroke.points;
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    if ((this.options as StrokeRendererOptions).smoothing !== false) {
      // Generate smooth SVG path
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        path += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
      }

      if (points.length > 2) {
        const last = points.length - 1;
        path += ` Q ${points[last - 1].x} ${points[last - 1].y} ${points[last].x} ${points[last].y}`;
      } else {
        path += ` L ${points[1].x} ${points[1].y}`;
      }
    } else {
      // Simple path
      points.slice(1).forEach(point => {
        path += ` L ${point.x} ${point.y}`;
      });
    }

    return path;
  }

  /**
   * Get stroke data in a serializable format
   */
  getStrokeData() {
    return {
      ...this.stroke,
      bounds: this.bounds
    };
  }

  /**
   * Get the stroke object
   */
  getStroke(): Stroke {
    return this.stroke;
  }

  /**
   * Check if this stroke contains the given point
   * Useful for erasure and selection
   */
  containsPoint(x: number, y: number, tolerance: number = 5): boolean {
    // First, check if point is within the bounds + tolerance
    if (
      x < this.bounds.x - tolerance ||
      y < this.bounds.y - tolerance ||
      x > this.bounds.x + this.bounds.width + tolerance ||
      y > this.bounds.y + this.bounds.height + tolerance
    ) {
      return false;
    }

    // For more precise detection, check distance to line segments
    const points = this.stroke.points;
    if (points.length < 2) return false;
    
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      
      // Calculate distance from point to line segment
      const distance = this.distanceToLineSegment(p1.x, p1.y, p2.x, p2.y, x, y);
      const strokeWidth = (this.stroke.size / 2) + tolerance;
      
      if (distance <= strokeWidth) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate distance from point to line segment
   */
  private distanceToLineSegment(
    x1: number, y1: number, 
    x2: number, y2: number, 
    px: number, py: number
  ): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
}