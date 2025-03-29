'use client';

export interface RenderOptions {
  scale: number;
  dpi?: number;
  pressureSensitivity?: boolean;
}

export interface AnnotationRenderer {
  render(ctx: CanvasRenderingContext2D, options: RenderOptions): void;
  toVectorPath?(): string; // For future vector-based exports
  getBounds(): { x: number; y: number; width: number; height: number };
}

// Base class for rendering different types of annotations
export default abstract class BaseRenderer implements AnnotationRenderer {
  protected context: CanvasRenderingContext2D | null = null;

  constructor(protected options: RenderOptions = { scale: 1 }) {}

  abstract render(ctx: CanvasRenderingContext2D, options: RenderOptions): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };

  protected setupContext(ctx: CanvasRenderingContext2D, options: RenderOptions) {
    this.context = ctx;
    ctx.save();
    ctx.scale(options.scale, options.scale);
  }

  protected restoreContext() {
    if (this.context) {
      this.context.restore();
      this.context = null;
    }
  }

  // Utility method for pressure sensitivity
  protected getPressureWidth(baseWidth: number, pressure: number): number {
    if (!this.options.pressureSensitivity) return baseWidth;
    // Map pressure (0-1) to 0.5-1.5 range for width multiplication
    const pressureScale = 0.5 + pressure;
    return baseWidth * pressureScale;
  }

  // For future vector export support
  toVectorPath?(): string {
    return '';
  }
}
