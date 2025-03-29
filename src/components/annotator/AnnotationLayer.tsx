'use client';

import { useEffect, useRef } from 'react';
import annotationStore, { Stroke, Point, ToolType } from '@/lib/annotationStore';

interface AnnotationLayerProps {
  width: number;
  height: number;
  scale: number;
  pageNumber: number;
  color: string;
  tool: ToolType;
  size: number;
  opacity: number;
  onPressureChange?: (pressure: number) => void;
}

export default function AnnotationLayer({
  width,
  height,
  scale,
  pageNumber,
  color,
  tool,
  size,
  opacity,
  onPressureChange
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const tempCtx = useRef<CanvasRenderingContext2D | null>(null);
  
  // Log dimensions for debugging
  useEffect(() => {
    console.log(`Canvas setup - width: ${width}, height: ${height}, scale: ${scale}`);
  }, [width, height, scale]);

  // Initialize canvas and draw existing strokes
  useEffect(() => {
    if (!canvasRef.current || !tempCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    
    // Get contexts with alpha channel enabled
    ctx.current = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true 
    });
    
    tempCtx.current = tempCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true
    });

    // Set canvas dimensions (actual pixels)
    const scaledWidth = Math.floor(width * scale);
    const scaledHeight = Math.floor(height * scale);
    
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;

    // Set CSS dimensions for proper display
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    tempCanvas.style.width = `${width}px`;
    tempCanvas.style.height = `${height}px`;

    // Scale context to match PDF scaling
    if (ctx.current) {
      ctx.current.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      ctx.current.scale(scale, scale);
    }
    
    if (tempCtx.current) {
      tempCtx.current.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      tempCtx.current.scale(scale, scale);
    }

    // Draw existing strokes
    drawStrokes();
    
    // Log canvas dimensions for debugging
    console.log('Canvas dimensions set:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      cssWidth: canvas.style.width,
      cssHeight: canvas.style.height,
      scale
    });
  }, [width, height, scale]);

  // Redraw when page changes
  useEffect(() => {
    drawStrokes();
  }, [pageNumber]);

  // Setup the drawing context with current tool settings
  const setupDrawingContext = (context: CanvasRenderingContext2D | null) => {
    if (!context) return;

    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    context.scale(scale, scale);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = size;
    context.globalAlpha = tool === 'highlighter' ? opacity : 1;
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  };

  // Draw a smooth line between points
  const drawSmoothLine = (
    context: CanvasRenderingContext2D,
    points: Point[],
    start: number,
    end: number
  ) => {
    if (!context || end - start < 1) return;

    context.beginPath();
    context.moveTo(points[start].x, points[start].y);

    // If only two points, draw a straight line
    if (end - start === 1) {
      context.lineTo(points[end].x, points[end].y);
    } else {
      // Use quadratic curves for smoother lines
      for (let i = start; i < end - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      // Connect to the last point
      context.lineTo(points[end].x, points[end].y);
    }
    context.stroke();
  };

  // Draw all strokes on the main canvas
  const drawStrokes = () => {
    if (!ctx.current) return;

    // Clear canvas
    ctx.current.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.current.clearRect(0, 0, width * scale, height * scale);
    ctx.current.scale(scale, scale);

    // Get and draw all strokes for current page
    const strokes = annotationStore.getStrokes(pageNumber);
    
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      // Set context properties for this stroke
      ctx.current!.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.current!.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
      ctx.current!.lineWidth = stroke.size;
      ctx.current!.globalAlpha = stroke.opacity;

      // Draw the stroke
      drawSmoothLine(ctx.current!, stroke.points, 0, stroke.points.length - 1);
    });

    // Reset context settings
    setupDrawingContext(ctx.current);
  };

  // Get the correct pointer position relative to the canvas
  const getCanvasPoint = (e: PointerEvent): Point => {
    if (!tempCanvasRef.current) {
      return { x: 0, y: 0, pressure: 0.5 };
    }
    
    const canvas = tempCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get the position in CSS pixels relative to the canvas
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    
    // Convert CSS pixels to canvas coordinates (accounting for scale)
    const x = cssX / (rect.width / width);
    const y = cssY / (rect.height / height);
    
    // Log coordinates for debugging
    if (isDrawing.current && currentStroke.current?.points.length === 1) {
      console.log('Pointer coords:', { 
        clientX: e.clientX, 
        clientY: e.clientY,
        rectLeft: rect.left,
        rectTop: rect.top,
        cssX, 
        cssY, 
        x, 
        y,
        canvasWidth: canvas.width,
        canvasCSSWidth: rect.width,
        scale
      });
    }
    
    return {
      x,
      y,
      pressure: e.pressure || 0.5
    };
  };

  // Handle real-time drawing and erasing
  useEffect(() => {
    const canvas = tempCanvasRef.current;
    if (!canvas || !tempCtx.current || !ctx.current) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDrawing.current = true;
      
      const point = getCanvasPoint(e);

      // Start new stroke
      currentStroke.current = {
        points: [point],
        color,
        size,
        opacity: tool === 'highlighter' ? opacity : 1,
        tool
      };

      // Setup drawing contexts
      setupDrawingContext(tempCtx.current);
      setupDrawingContext(ctx.current);
      
      // For eraser, we draw directly to the main canvas for immediate effect
      if (tool === 'eraser') {
        ctx.current!.globalCompositeOperation = 'destination-out';
        ctx.current!.beginPath();
        ctx.current!.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
        ctx.current!.fill();
      }

      onPressureChange?.(e.pressure);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawing.current || !currentStroke.current) return;

      const point = getCanvasPoint(e);
      currentStroke.current.points.push(point);

      // For eraser, apply directly to main canvas for immediate effect
      if (tool === 'eraser' && ctx.current) {
        // Draw eraser circle at current position
        ctx.current.globalCompositeOperation = 'destination-out';
        ctx.current.beginPath();
        ctx.current.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
        ctx.current.fill();
        
        // Also connect to previous point for continuous erasing
        if (currentStroke.current.points.length > 1) {
          const prevPoint = currentStroke.current.points[currentStroke.current.points.length - 2];
          ctx.current.beginPath();
          ctx.current.moveTo(prevPoint.x, prevPoint.y);
          ctx.current.lineTo(point.x, point.y);
          ctx.current.lineWidth = size;
          ctx.current.stroke();
        }
      } else if (tempCtx.current) {
        // For drawing tools, use the temp canvas
        tempCtx.current.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        tempCtx.current.clearRect(0, 0, width * scale, height * scale);
        tempCtx.current.scale(scale, scale);
        
        // Draw the current stroke on temp canvas
        drawSmoothLine(
          tempCtx.current,
          currentStroke.current.points,
          0,
          currentStroke.current.points.length - 1
        );
      }

      onPressureChange?.(e.pressure);
    };

    const handlePointerUp = () => {
      if (!isDrawing.current || !currentStroke.current) return;
      
      // Only add strokes with at least 2 points
      if (currentStroke.current.points.length > 1) {
        annotationStore.addStroke(pageNumber, currentStroke.current);
      }
      
      // Clear temp canvas
      if (tempCtx.current) {
        tempCtx.current.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        tempCtx.current.clearRect(0, 0, width * scale, height * scale);
      }
      
      // If not erasing, redraw all strokes (eraser already updated main canvas)
      if (tool !== 'eraser') {
        drawStrokes();
      }

      isDrawing.current = false;
      currentStroke.current = null;
    };

    // Add event listeners with pointer capture for better tracking
    const pointerDownHandler = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      handlePointerDown(e);
    };

    canvas.addEventListener('pointerdown', pointerDownHandler);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', pointerDownHandler);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [color, tool, size, opacity, pageNumber, width, height, scale, onPressureChange]);

  return (
    <div 
      ref={canvasContainerRef}
      className="absolute inset-0 pointer-events-none" 
      style={{
        width: `${width}px`,
        height: `${height}px`,
        touchAction: 'none'
      }}
    >
      {/* Main canvas for final strokes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      {/* Temporary canvas for current stroke */}
      <canvas
        ref={tempCanvasRef}
        className="absolute inset-0 pointer-events-auto touch-none"
        style={{
          cursor: tool === 'eraser' ? 'crosshair' : 'default',
          touchAction: 'none'
        }}
      />
    </div>
  );
}