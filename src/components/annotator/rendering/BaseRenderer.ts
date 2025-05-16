'use client';

export interface RenderOptions {
  scale: number;
  [key: string]: any; // Allow additional properties for subclasses
}

export interface AnnotationRenderer {
  render(ctx: CanvasRenderingContext2D, options: RenderOptions): void;
}

// Base class for rendering different types of annotations
export default abstract class BaseRenderer implements AnnotationRenderer {
  protected options: RenderOptions;
  protected context: CanvasRenderingContext2D | null = null;
  
  constructor(options: RenderOptions = { scale: 1 }) {
    this.options = options;
  }
  
  /**
   * Set up the canvas context for rendering
   */
  protected setupContext(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
    this.context = ctx;
    ctx.save();
    
    // Apply any scaling if needed
    const scale = options.scale || this.options.scale || 1;
    if (scale !== 1) {
      // Only scale if we haven't already applied a transform
      const transform = ctx.getTransform();
      if (transform.a === 1 && transform.d === 1) {
        ctx.scale(scale, scale);
      }
    }
  }
  
  /**
   * Restore the canvas context to its previous state
   */
  protected restoreContext(): void {
    if (this.context) {
      this.context.restore();
      this.context = null;
    }
  }
  
  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract render(ctx: CanvasRenderingContext2D, options: RenderOptions): void;
}