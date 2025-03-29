'use client';

import { useEffect, useRef } from 'react';
import annotationStore, { Stroke } from '@/lib/annotationStore';

interface AnnotationLayerProps {
  width: number;
  height: number;
  scale: number;
  pageNumber: number;
  color?: string;
  size?: number;
  onPressureChange?: (pressure: number) => void;
}

export default function AnnotationLayer({
  width,
  height,
  scale,
  pageNumber,
  color = '#000000',
  size = 5,
  onPressureChange
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke>({ points: [], color, size });
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    ctx.current = canvas.getContext('2d');

    // Set canvas dimensions to match PDF page at 100% scale
    canvas.width = width;
    canvas.height = height;

    if (ctx.current) {
      ctx.current.scale(1, 1); // Reset scale
      ctx.current.lineCap = 'round';
      ctx.current.lineJoin = 'round';
      ctx.current.strokeStyle = color;
      ctx.current.lineWidth = size;
    }

    // Draw existing strokes
    drawStrokes();
  }, [width, height, color, size, pageNumber]);

  // Draw all stored strokes for the current page
  const drawStrokes = () => {
    if (!ctx.current) return;

    // Clear canvas
    ctx.current.clearRect(0, 0, width, height);

    // Get stored strokes for this page
    const strokes = annotationStore.getStrokes(pageNumber);

    // Draw each stroke
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.current!.beginPath();
      ctx.current!.strokeStyle = stroke.color;

      const points = stroke.points;
      const firstPoint = points[0];
      ctx.current!.moveTo(firstPoint.x, firstPoint.y);

      // Draw line segments with pressure
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const pressure = point.pressure || 0.5; // Default pressure if not recorded
        ctx.current!.lineWidth = stroke.size * pressure;
        ctx.current!.lineTo(point.x, point.y);
        ctx.current!.stroke();
        ctx.current!.beginPath();
        ctx.current!.moveTo(point.x, point.y);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx.current) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDrawing.current = true;
      const x = e.offsetX;
      const y = e.offsetY;
      
      // Start new stroke
      currentStroke.current = {
        points: [{ x, y, pressure: e.pressure }],
        color,
        size
      };

      ctx.current?.beginPath();
      ctx.current?.moveTo(x, y);
      
      onPressureChange?.(e.pressure);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawing.current || !ctx.current) return;
      
      const x = e.offsetX;
      const y = e.offsetY;
      const pressure = e.pressure || 0.5;
      
      // Add point to current stroke
      currentStroke.current.points.push({ x, y, pressure });
      
      // Draw line segment
      ctx.current.beginPath();
      ctx.current.strokeStyle = color;
      ctx.current.lineWidth = size * pressure;
      
      const prevPoint = currentStroke.current.points[currentStroke.current.points.length - 2];
      ctx.current.moveTo(prevPoint.x, prevPoint.y);
      ctx.current.lineTo(x, y);
      ctx.current.stroke();
      
      onPressureChange?.(pressure);
    };

    const handlePointerUp = () => {
      if (!isDrawing.current) return;
      
      isDrawing.current = false;
      // Save the completed stroke
      if (currentStroke.current.points.length > 0) {
        annotationStore.addStroke(pageNumber, currentStroke.current);
      }
      ctx.current?.closePath();
    };

    // Add event listeners
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerout', handlePointerUp);

    // Remove event listeners on cleanup
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerout', handlePointerUp);
    };
  }, [color, size, pageNumber, onPressureChange]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto touch-none"
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}