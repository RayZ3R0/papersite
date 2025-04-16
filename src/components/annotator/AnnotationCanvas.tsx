import React, { useRef, useEffect, useState } from 'react';
import type { ViewportState, PDFPageInfo, ToolState, Annotation, Stroke, Point } from '@/types/annotator';

interface AnnotationCanvasProps {
  viewport: ViewportState;
  pageInfo: PDFPageInfo;
  toolState: ToolState;
  annotations: Annotation[];
  onStrokeStart: (stroke: Stroke) => void;
  onStrokeUpdate: (stroke: Stroke) => void;
  onStrokeComplete: (stroke: Stroke) => void;
}

export default function AnnotationCanvas({
  viewport,
  pageInfo,
  toolState,
  annotations,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeComplete
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Convert browser/screen coordinates to PDF coordinates
  const screenToPDFCoordinates = (screenX: number, screenY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position within the canvas element (in CSS pixels)
    const cssX = screenX - rect.left;
    const cssY = screenY - rect.top;
    
    // Convert to canvas coordinates (accounting for any CSS sizing)
    const canvasX = cssX * (canvas.width / rect.width);
    const canvasY = cssY * (canvas.height / rect.height);
    
    // Convert canvas coordinates to PDF points
    const pdfX = canvasX / viewport.scale;
    const pdfY = canvasY / viewport.scale;
    
    return { x: pdfX, y: pdfY };
  };
  
  // Create a drawn stroke instance
  const createStroke = (x: number, y: number, pressure: number = 0.5): Stroke => ({
    id: Date.now().toString(),
    tool: toolState.activeTool,
    color: toolState.color,
    size: toolState.size,
    opacity: toolState.opacity,
    points: [{ x, y, pressure }]
  });
  
  // Create custom cursor for eraser
  const createEraserCursor = (size: number): string => {
    if (!cursorCanvasRef.current) {
      cursorCanvasRef.current = document.createElement('canvas');
    }
    const canvas = cursorCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return 'crosshair';

    // Size the cursor canvas
    const padding = 4;
    const totalSize = size + padding * 2;
    canvas.width = totalSize;
    canvas.height = totalSize;

    // Clear canvas
    context.clearRect(0, 0, totalSize, totalSize);

    // Draw outer circle (border)
    context.beginPath();
    context.arc(totalSize / 2, totalSize / 2, size / 2 + 1, 0, Math.PI * 2);
    context.strokeStyle = '#000000';
    context.lineWidth = 1;
    context.stroke();

    // Draw inner circle (fill)
    context.beginPath();
    context.arc(totalSize / 2, totalSize / 2, size / 2, 0, Math.PI * 2);
    context.strokeStyle = '#ffffff';
    context.stroke();

    return `url(${canvas.toDataURL()}) ${totalSize / 2} ${totalSize / 2}, crosshair`;
  };
  
  // Draw all annotations
  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the canvas state and apply viewport transform
    ctx.save();
    ctx.scale(viewport.scale, viewport.scale);
    
    // Draw all existing annotations
    annotations.forEach(annotation => {
      if (annotation.type === 'stroke') {
        drawStroke(ctx, annotation);
      }
    });
    
    // Draw active stroke if exists
    if (activeStrokeRef.current && activeStrokeRef.current.points.length > 0) {
      drawStroke(ctx, activeStrokeRef.current);
    }
    
    // Restore canvas state
    ctx.restore();
  };
  
  // Calculate pressure-adjusted stroke size
  const getPressureSize = (baseSize: number, pressure: number = 0.5): number => {
    // Normalize pressure (usually between 0.5 and 1.0)
    const normalizedPressure = Math.max(0.5, Math.min(1.0, pressure));
    return baseSize * (0.8 + (normalizedPressure * 0.4));
  };
  
  // Draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;
    
    ctx.save();
    
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = stroke.opacity;
    
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    // Begin path
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    // Draw a smooth curve through all points
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
      const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
      
      // Adjust line width based on pressure if available
      if (stroke.points[i].pressure) {
        ctx.lineWidth = getPressureSize(stroke.size, stroke.points[i].pressure);
      }
      
      ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
    }
    
    // Connect to the last point
    if (stroke.points.length > 1) {
      const lastIdx = stroke.points.length - 1;
      const lastPoint = stroke.points[lastIdx];
      const prevPoint = stroke.points[lastIdx - 1];
      
      // Adjust line width for last segment
      if (lastPoint.pressure) {
        ctx.lineWidth = getPressureSize(stroke.size, lastPoint.pressure);
      }
      
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, lastPoint.x, lastPoint.y);
    }
    
    ctx.stroke();
    ctx.restore();
  };
  
  // Update canvas size and redraw when viewport changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Match canvas dimensions exactly to PDF dimensions
    canvas.width = pageInfo.width;
    canvas.height = pageInfo.height;
    
    // Redraw all annotations with new dimensions
    drawAnnotations();
  }, [viewport, pageInfo, annotations]);
  
  // Setup event handlers for drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      
      const pdfPoint = screenToPDFCoordinates(e.clientX, e.clientY);
      
      // Start new stroke
      const stroke = createStroke(pdfPoint.x, pdfPoint.y, e.pressure || 0.5);
      activeStrokeRef.current = stroke;
      isDrawingRef.current = true;
      
      // Notify parent
      onStrokeStart(stroke);
      
      // Draw initial point
      drawAnnotations();
    };
    
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current || !activeStrokeRef.current) return;
      
      e.preventDefault();
      const pdfPoint = screenToPDFCoordinates(e.clientX, e.clientY);
      pdfPoint.pressure = e.pressure || 0.5;
      
      // Add point to active stroke
      activeStrokeRef.current.points.push(pdfPoint);
      
      // Update stroke in parent
      onStrokeUpdate(activeStrokeRef.current);
      
      // Redraw
      drawAnnotations();
    };
    
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDrawingRef.current || !activeStrokeRef.current) return;
      
      e.preventDefault();
      
      // Finalize the stroke
      onStrokeComplete(activeStrokeRef.current);
      
      // Reset state
      isDrawingRef.current = false;
      activeStrokeRef.current = null;
    };
    
    // Register event handlers
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [pageInfo, viewport, toolState, onStrokeStart, onStrokeUpdate, onStrokeComplete]);
  
  // Update cursor for eraser tool
  useEffect(() => {
    if (canvasRef.current) {
      if (toolState.activeTool === 'eraser') {
        canvasRef.current.style.cursor = createEraserCursor(toolState.size * viewport.scale);
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    }
  }, [toolState.activeTool, toolState.size, viewport.scale]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 touch-none"
      style={{
        touchAction: 'none',
        width: `${pageInfo.width * viewport.scale}px`,
        height: `${pageInfo.height * viewport.scale}px`,
        transformOrigin: 'top left',
      }}
    />
  );
}