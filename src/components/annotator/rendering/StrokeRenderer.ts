'use client';

import BaseRenderer, { RenderOptions } from './BaseRenderer';
import { Point, Stroke } from '@/lib/annotationStore';

interface StrokeRendererOptions extends RenderOptions {
  smoothing?: boolean;
}

export default class StrokeRenderer extends BaseRenderer {
  private stroke: Stroke;
  private bounds: { x: number; y: number; width: number; height: number };

  constructor(stroke: Stroke, options: StrokeRendererOptions = { scale: 1 }) {
    super(options);
    this.stroke = stroke;
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

  render(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
    this.setupContext(ctx, options);
    
    if (!this.context) return;
    const context = this.context;

    // Setup stroke style
    context.strokeStyle = this.stroke.color;
    context.globalAlpha = this.stroke.opacity;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // Handle different tools
    if (this.stroke.tool === 'highlighter') {
      context.globalCompositeOperation = 'multiply';
    } else if (this.stroke.tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }

    // Draw the stroke
    if ((this.options as StrokeRendererOptions).smoothing !== false) {
      this.drawSmoothLine(context, this.stroke.points);
    } else {
      // Simple line drawing for performance if needed
      context.beginPath();
      context.moveTo(this.stroke.points[0].x, this.stroke.points[0].y);
      
      this.stroke.points.forEach((point, i) => {
        const width = this.getPressureWidth(this.stroke.size, point.pressure);
        context.lineWidth = width;
        context.lineTo(point.x, point.y);
      });
      
      context.stroke();
    }

    this.restoreContext();
  }

  // Generate SVG path for vector export
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
}
