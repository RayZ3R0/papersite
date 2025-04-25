import { useEffect, useRef, useState, useCallback } from 'react';
import { AnnotationLayerProps, Point, Path } from '@/types/annotator';
import '@/styles/annotator.css';

export default function AnnotationLayer({
  pageNumber,
  scale,
  rotation,
  width,
  height,
  onAnnotationChange,
  activeTool,
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Path[]>([]);
  const currentPath = useRef<Point[]>([]);
  const requestRef = useRef<number>();

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    // Set canvas dimensions
    canvas.width = width * scale * window.devicePixelRatio;
    canvas.height = height * scale * window.devicePixelRatio;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // Configure context for high-quality drawing
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    contextRef.current = context;
    redrawPaths(paths);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [width, height, scale]);

  // Handle rotation changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const currentPaths = paths;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.translate(-canvas.width / 2, -canvas.height / 2);

    redrawPaths(currentPaths);
    context.restore();
  }, [rotation, paths]);

  // Smooth path drawing with animation frame
  const redrawPaths = useCallback((pathsToDraw: Path[]) => {
    const context = contextRef.current;
    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    pathsToDraw.forEach(path => {
      const { tool, points } = path;
      
      if (tool.type === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.strokeStyle = 'rgba(255,255,255,1)';
      } else {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = tool.color || '#000000';
      }
      
      context.lineWidth = tool.width * scale;
      if (tool.opacity !== undefined) {
        context.globalAlpha = tool.opacity;
      }

      // Draw path with smooth curves
      if (points.length > 0) {
        context.beginPath();
        context.moveTo(points[0].x * scale, points[0].y * scale);

        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2 * scale;
          const yc = (points[i].y + points[i + 1].y) / 2 * scale;
          context.quadraticCurveTo(
            points[i].x * scale,
            points[i].y * scale,
            xc,
            yc
          );
        }

        // Handle the last two points
        if (points.length > 2) {
          const lastPoint = points[points.length - 1];
          const secondLastPoint = points[points.length - 2];
          context.quadraticCurveTo(
            secondLastPoint.x * scale,
            secondLastPoint.y * scale,
            lastPoint.x * scale,
            lastPoint.y * scale
          );
        } else if (points.length === 2) {
          context.lineTo(
            points[1].x * scale,
            points[1].y * scale
          );
        }

        context.stroke();
      }
    });

    context.globalAlpha = 1;
  }, [scale]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const point = getCoordinates(e, canvas);
    currentPath.current = [point];

    // Set up context for current tool
    const context = contextRef.current;
    if (context) {
      if (activeTool.type === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.strokeStyle = 'rgba(255,255,255,1)';
      } else {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = activeTool.color || '#000000';
      }
      context.lineWidth = activeTool.width * scale;
      context.globalAlpha = activeTool.opacity || 1;
    }
  }, [activeTool, scale]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCoordinates(e, canvas);
    currentPath.current.push(point);

    // Use requestAnimationFrame for smooth drawing
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    requestRef.current = requestAnimationFrame(() => {
      const context = contextRef.current;
      if (!context) return;

      // Clear and redraw all paths
      redrawPaths([...paths, {
        id: 'current',
        tool: activeTool,
        points: currentPath.current,
        timestamp: Date.now()
      }]);
    });
  }, [isDrawing, paths, activeTool, redrawPaths]);

  const endDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentPath.current.length > 0) {
      const newPath: Path = {
        id: Date.now().toString(),
        tool: activeTool,
        points: currentPath.current,
        timestamp: Date.now(),
      };

      const newPaths = [...paths, newPath];
      setPaths(newPaths);
      onAnnotationChange?.({
        pageNumber,
        paths: newPaths,
      });
    }
    currentPath.current = [];

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, [isDrawing, activeTool, paths, pageNumber, onAnnotationChange]);

  // Utility function to get coordinates from mouse/touch event
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): Point => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
      pressure: 'touches' in e && e.touches[0] ? e.touches[0].force : undefined
    };
  };

  return (
    <canvas
      ref={canvasRef}
      className={`annotation-layer active ${
        activeTool.type === 'eraser' ? 'cursor-eraser' : 'cursor-pencil'
      }`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
      onTouchCancel={endDrawing}
    />
  );
}