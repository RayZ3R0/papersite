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

// Get distance between two points
const getDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

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
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const tempCtx = useRef<CanvasRenderingContext2D | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const pointBuffer = useRef<Point[]>([]);

  // Create custom cursor for eraser
  const createEraserCursor = (size: number): string => {
    if (!cursorCanvasRef.current) {
      cursorCanvasRef.current = document.createElement('canvas');
    }
    const canvas = cursorCanvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return 'crosshair';

    // Set canvas size to accommodate the circle and border
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

  // Draw a smooth line between points
  const drawSmoothLine = (
    context: CanvasRenderingContext2D,
    points: Point[]
  ) => {
    if (!context || points.length < 2) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    // Handle last two points
    if (points.length > 2) {
      const last = points.length - 1;
      context.quadraticCurveTo(
        points[last - 1].x,
        points[last - 1].y,
        points[last].x,
        points[last].y
      );
    } else {
      context.lineTo(points[1].x, points[1].y);
    }

    context.stroke();
  };

  // Setup drawing context
  const setupDrawingContext = (context: CanvasRenderingContext2D | null) => {
    if (!context) return;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(scale, scale);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = size;
    context.globalAlpha = tool === 'highlighter' ? opacity : 1;
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  };

  // Draw an eraser stroke
  const drawEraserStroke = (
    context: CanvasRenderingContext2D,
    point: Point,
    lastPoint: Point | null,
    strokeSize: number
  ) => {
    if (!context) return;

    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineWidth = strokeSize;

    // Connect to previous point if exists
    if (lastPoint) {
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    }

    // Draw circle at current point
    context.beginPath();
    context.arc(point.x, point.y, strokeSize / 2, 0, Math.PI * 2);
    context.fill();
  };

  // Draw all strokes
  const drawStrokes = () => {
    if (!ctx.current) return;
    const context = ctx.current;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width * scale, height * scale);
    context.scale(scale, scale);

    const strokes = annotationStore.getStrokes(pageNumber);
    
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      context.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      context.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
      context.lineWidth = stroke.size; // Use the stored stroke size
      context.globalAlpha = stroke.opacity;

      if (stroke.tool === 'eraser') {
        for (let i = 1; i < stroke.points.length; i++) {
          drawEraserStroke(context, stroke.points[i], stroke.points[i - 1], stroke.size);
        }
      } else {
        drawSmoothLine(context, stroke.points);
      }
    });

    setupDrawingContext(context);
  };

  // Get canvas point
  const getCanvasPoint = (e: PointerEvent): Point => {
    if (!tempCanvasRef.current) {
      return { x: 0, y: 0, pressure: 0.5 };
    }
    
    const canvas = tempCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    
    return {
      x: cssX / (rect.width / width),
      y: cssY / (rect.height / height),
      pressure: e.pressure || 0.5
    };
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !tempCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    
    ctx.current = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true 
    });
    
    tempCtx.current = tempCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true
    });

    const scaledWidth = Math.floor(width * scale);
    const scaledHeight = Math.floor(height * scale);
    
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    tempCanvas.style.width = `${width}px`;
    tempCanvas.style.height = `${height}px`;

    if (ctx.current) {
      ctx.current.setTransform(1, 0, 0, 1, 0, 0);
      ctx.current.scale(scale, scale);
    }
    
    if (tempCtx.current) {
      tempCtx.current.setTransform(1, 0, 0, 1, 0, 0);
      tempCtx.current.scale(scale, scale);
    }

    drawStrokes();
  }, [width, height, scale]);

  // Handle drawing events
  useEffect(() => {
    const canvas = tempCanvasRef.current;
    if (!canvas || !tempCtx.current || !ctx.current) return;

    const mainContext = ctx.current;
    const tempContext = tempCtx.current;

    const handlePointerDown = (e: PointerEvent) => {
      isDrawing.current = true;
      const point = getCanvasPoint(e);
      
      currentStroke.current = {
        points: [point],
        color,
        size,
        opacity: tool === 'highlighter' ? opacity : 1,
        tool
      };

      lastPoint.current = point;
      pointBuffer.current = [point];

      setupDrawingContext(tempContext);
      setupDrawingContext(mainContext);
      
      if (tool === 'eraser') {
        drawEraserStroke(mainContext, point, null, size);
      }

      onPressureChange?.(e.pressure);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawing.current || !currentStroke.current || !lastPoint.current) return;

      const point = getCanvasPoint(e);
      const dist = getDistance(lastPoint.current, point);
      
      if (dist > (tool === 'pen' ? 2 : 4)) {
        currentStroke.current.points.push(point);
        pointBuffer.current.push(point);

        if (tool === 'eraser') {
          drawEraserStroke(mainContext, point, lastPoint.current, size);
        } else {
          tempContext.setTransform(1, 0, 0, 1, 0, 0);
          tempContext.clearRect(0, 0, width * scale, height * scale);
          tempContext.scale(scale, scale);
          
          drawSmoothLine(tempContext, pointBuffer.current);
        }

        lastPoint.current = point;
      }

      onPressureChange?.(e.pressure);
    };

    const handlePointerUp = () => {
      if (!isDrawing.current || !currentStroke.current) return;
      
      if (currentStroke.current.points.length > 1) {
        annotationStore.addStroke(pageNumber, currentStroke.current);
      }
      
      tempContext.setTransform(1, 0, 0, 1, 0, 0);
      tempContext.clearRect(0, 0, width * scale, height * scale);
      
      if (tool !== 'eraser') {
        drawStrokes();
      }

      isDrawing.current = false;
      currentStroke.current = null;
      lastPoint.current = null;
      pointBuffer.current = [];
    };

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

  // Update cursor for eraser
  useEffect(() => {
    if (tool === 'eraser' && tempCanvasRef.current) {
      const cursor = createEraserCursor(size);
      tempCanvasRef.current.style.cursor = cursor;
    }
  }, [tool, size]);

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
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      <canvas
        ref={tempCanvasRef}
        className="absolute inset-0 pointer-events-auto touch-none"
        style={{
          cursor: tool === 'eraser' ? createEraserCursor(size) : 'default',
          touchAction: 'none'
        }}
      />
    </div>
  );
}