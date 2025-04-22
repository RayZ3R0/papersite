import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { ToolType } from '@/types/annotator';

// Worker config for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
  onClose?: () => void;
}

// Path point interface
interface PathPoint {
  x: number;
  y: number;
  pressure?: number;
}

// Annotation path data
interface AnnotationPath {
  id: string;
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  points: PathPoint[];
}

// Main component
export default function PDFViewer({ file, onClose }: PDFViewerProps) {
  // State for PDF
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<number>(0);
  
  // Page dimensions
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}>({
    width: 0,
    height: 0
  });
  
  // Annotation state
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [currentSize, setCurrentSize] = useState<number>(2);
  const [currentOpacity, setCurrentOpacity] = useState<number>(1.0);
  
  // Store annotations for each page
  const [annotations, setAnnotations] = useState<Record<number, AnnotationPath[]>>({});
  
  // Store history for undo/redo
  const [history, setHistory] = useState<Record<number, { past: AnnotationPath[][], future: AnnotationPath[][] }>>({});
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<AnnotationPath | null>(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const lastMousePosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfLayerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get current page annotations
  const currentPageAnnotations = annotations[pageNumber] || [];
  
  // Handle PDF document load
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  // Handle page load and get dimensions
  const handlePageLoadSuccess = (page: any) => {
    const { width, height } = page;
    setPageDimensions({ width, height });
    
    // Initialize canvas after page loads
    initializeCanvases(width, height);
  };
  
  // Initialize canvases with correct dimensions
const initializeCanvases = (width: number, height: number) => {
  const mainCanvas = mainCanvasRef.current;
  const drawingCanvas = canvasRef.current;
  
  if (!mainCanvas || !drawingCanvas) return;
  
  console.log('Initializing canvases with dimensions:', width, height);
  
  // IMPORTANT - Set actual pixel dimensions, not CSS dimensions
  mainCanvas.width = width;
  mainCanvas.height = height;
  drawingCanvas.width = width;
  drawingCanvas.height = height;
  
  // Explicitly set CSS dimensions to match container
  mainCanvas.style.width = '100%';
  mainCanvas.style.height = '100%';
  drawingCanvas.style.width = '100%';
  drawingCanvas.style.height = '100%';
  
  // Clear the main canvas
  const mainCtx = mainCanvas.getContext('2d', { alpha: true });
  if (mainCtx) {
    mainCtx.clearRect(0, 0, width, height);
    // Redraw any existing annotations
    redrawAnnotations();
  }
};
  
  // Redraw all annotations on main canvas
  const redrawAnnotations = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all annotations
    const pageAnnotations = annotations[pageNumber] || [];
    pageAnnotations.forEach(path => {
      drawPath(ctx, path);
    });
  }, [annotations, pageNumber]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };
  
  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };
  
  const handleZoomReset = () => {
    setScale(1);
  };
  
  // Create a new annotation path
  const createPath = (x: number, y: number, pressure: number = 0.5): AnnotationPath => ({
    id: Date.now().toString(),
    tool: currentTool,
    color: currentColor,
    size: currentSize,
    opacity: currentOpacity,
    points: [{ x, y, pressure }]
  });
  
  // Draw a path on canvas
const drawPath = (ctx: CanvasRenderingContext2D, path: AnnotationPath) => {
  if (path.points.length < 2) return;
  
  console.log('Drawing path with', path.points.length, 'points');
  
  ctx.save();
  
  // Set stroke properties
  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = path.opacity;
  
  // Handle different tools - use simplest approach first
  if (path.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else if (path.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'multiply';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Begin drawing with simpler path
  ctx.beginPath();
  ctx.moveTo(path.points[0].x, path.points[0].y);
  
  // Simple line segments - no curves for now
  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }
  
  ctx.stroke();
  ctx.restore();
};
  
  // Draw the current path on the drawing canvas
  const drawCurrentPath = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPath) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear drawing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the current path
    drawPath(ctx, currentPath);
  }, [currentPath]);
  
  // Save history for undo/redo
  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const pageHistory = prev[pageNumber] || { past: [], future: [] };
      const currentAnnotations = annotations[pageNumber] || [];
      
      return {
        ...prev,
        [pageNumber]: {
          past: [...pageHistory.past, [...currentAnnotations]],
          future: []
        }
      };
    });
  }, [pageNumber, annotations]);
  
  // Undo the last change
  const handleUndo = () => {
    if (!canUndo()) return;
    
    setHistory(prev => {
      const pageHistory = prev[pageNumber] || { past: [], future: [] };
      
      if (pageHistory.past.length === 0) {
        return prev;
      }
      
      const newPast = [...pageHistory.past];
      const lastState = newPast.pop()!;
      
      // Current annotations to push to future
      const currentAnnotations = annotations[pageNumber] || [];
      
      // Update annotations
      setAnnotations(prev => ({
        ...prev,
        [pageNumber]: lastState
      }));
      
      // Update history
      return {
        ...prev,
        [pageNumber]: {
          past: newPast,
          future: [currentAnnotations, ...pageHistory.future]
        }
      };
    });
  };
  
  // Redo the last undone change
  const handleRedo = () => {
    if (!canRedo()) return;
    
    setHistory(prev => {
      const pageHistory = prev[pageNumber] || { past: [], future: [] };
      
      if (pageHistory.future.length === 0) {
        return prev;
      }
      
      const newFuture = [...pageHistory.future];
      const nextState = newFuture.shift()!;
      
      // Current annotations to push to past
      const currentAnnotations = annotations[pageNumber] || [];
      
      // Update annotations
      setAnnotations(prev => ({
        ...prev,
        [pageNumber]: nextState
      }));
      
      // Update history
      return {
        ...prev,
        [pageNumber]: {
          past: [...pageHistory.past, currentAnnotations],
          future: newFuture
        }
      };
    });
  };
  
  // Check if undo is available
  const canUndo = () => {
    return (history[pageNumber]?.past.length || 0) > 0;
  };
  
  // Check if redo is available
  const canRedo = () => {
    return (history[pageNumber]?.future.length || 0) > 0;
  };
  
  // Clear all annotations on current page
  const handleClear = () => {
    // Save current state to history before clearing
    saveHistory();
    
    // Clear annotations
    setAnnotations(prev => ({
      ...prev,
      [pageNumber]: []
    }));
  };
  
  // Export PDF with annotations
  const handleExport = async () => {
    if (!pdfLayerRef.current) return;
    
    try {
      setIsSaving(true);
      setSaveProgress(0.1);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      // Capture each page with annotations
      for (let page = 1; page <= numPages; page++) {
        // Set current page to be captured
        setPageNumber(page);
        
        // Wait for page to render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Capture the PDF with annotations
        const canvas = await html2canvas(pdfLayerRef.current, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (document) => {
            // Give clone time to render
            return new Promise(resolve => {
              setTimeout(resolve, 100);
            });
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Add a new page for each page after the first
        if (page > 1) {
          pdf.addPage();
        }
        
        // Calculate aspect ratio to fit PDF page
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // Update progress
        setSaveProgress(0.1 + 0.8 * (page / numPages));
      }
      
      // Save the PDF
      pdf.save(`${file.name.replace('.pdf', '')}_annotated.pdf`);
      
      // Reset page number
      setPageNumber(1);
      setSaveProgress(1);
      
      // Wait to hide progress
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsSaving(false);
      alert('Failed to export PDF. Please try again.');
    }
  };
  
  // Get canvas coordinates from mouse/touch position
const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent | PointerEvent): PathPoint => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };
  
  // Get canvas bounding rectangle
  const rect = canvas.getBoundingClientRect();
  
  // Get clientX and clientY from event
  let clientX, clientY, pressure = 0.5;
  
  if ('touches' in e) {
    // Touch event
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    // Mouse or Pointer event
    clientX = e.clientX;
    clientY = e.clientY;
    if ('pressure' in e) {
      pressure = (e as PointerEvent).pressure || 0.5;
    }
  } else {
    return { x: 0, y: 0 };
  }
  
  // CRITICAL: Calculate correct scaling between canvas internal dimensions and displayed size
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  
  console.log('Canvas coordinate:', { x, y, pressure });
  
  return { x, y, pressure };
};
  
  // Drawing event handlers
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  // Start drawing
  const handlePointerDown = (e: PointerEvent) => {
    if (isPanning) return;
    
    console.log('Pointer down at', e.clientX, e.clientY);
    
    // Capture pointer events on canvas
    canvas.setPointerCapture(e.pointerId);
    
    const point = getCanvasCoordinates(e);
    const path = createPath(point.x, point.y, e.pressure || 0.5);
    
    setIsDrawing(true);
    setCurrentPath(path);
    
    // Draw a visible dot at the start point for debugging
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = currentColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Continue drawing
  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing || !currentPath) return;
    
    // Debug logging
    console.log('Pointer move while drawing');
    
    const point = getCanvasCoordinates(e);
    
    setCurrentPath(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point]
      };
    });
  };
    
    // End drawing
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDrawing || !currentPath) return;
      
      // Add the path to annotations
      setAnnotations(prev => {
        const pageAnnotations = [...(prev[pageNumber] || [])];
        
        if (currentPath && currentPath.points.length > 1) {
          pageAnnotations.push(currentPath);
        }
        
        return {
          ...prev,
          [pageNumber]: pageAnnotations
        };
      });
      
      // Save to history
      saveHistory();
      
      // Reset drawing state
      setIsDrawing(false);
      setCurrentPath(null);
      
      // Clear the drawing canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    // Register events if not panning
    if (!isPanning) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointercancel', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);
    }
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [
    currentTool,
    currentColor,
    currentSize,
    currentOpacity,
    isDrawing,
    currentPath,
    pageNumber,
    isPanning,
    saveHistory
  ]);
  
  // Update cursor style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (currentTool === 'eraser') {
      canvas.style.cursor = 'crosshair';
    } else if (isPanning) {
      canvas.style.cursor = 'grabbing';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [currentTool, isPanning]);
  
  // Draw current path when it changes
  useEffect(() => {
    drawCurrentPath();
  }, [currentPath, drawCurrentPath]);
  
  // Redraw all annotations when they change or page changes
  useEffect(() => {
    redrawAnnotations();
  }, [annotations, pageNumber, redrawAnnotations]);
  
  // Setup panning functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      // Start panning with middle button or when space is held
      if (e.button === 1 || (e.button === 0 && e.getModifierState('Space'))) {
        setIsPanning(true);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        container.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      
      container.scrollLeft -= dx;
      container.scrollTop -= dy;
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    };
    
    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        container.style.cursor = 'default';
      }
    };
    
    // Space key handling for pan mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        container.style.cursor = 'grab';
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        container.style.cursor = 'default';
      }
    };
    
    // Register pan events
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning]);
  
  // Add wheel zoom support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Zoom with Ctrl+wheel
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = Math.sign(e.deltaY) * -0.1;
        setScale(prevScale => Math.max(0.5, Math.min(prevScale + delta, 3)));
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Page navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        handlePageChange(pageNumber + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        handlePageChange(pageNumber - 1);
      }
      
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      }
      
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber]);
  
  // Tool change methods
  const handleToolChange = (tool: ToolType) => {
    setCurrentTool(tool);
  };
  
  // Define color presets
  const colorPresets = [
    '#000000', // Black
    '#4b5563', // Gray
    '#ef4444', // Red
    '#f97316', // Orange
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
  ];
  
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex flex-wrap items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
            <button
              onClick={() => handleToolChange('pen')}
              className={`p-2 rounded-md ${currentTool === 'pen' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100 text-gray-700'}`}
              title="Pen"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleToolChange('highlighter')}
              className={`p-2 rounded-md ${currentTool === 'highlighter' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100 text-gray-700'}`}
              title="Highlighter"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11.5h6M9 15h6M19.707 6.707c.39.39.39 1.024 0 1.414L12 16H8v-4l8.293-8.293c.39-.39 1.024-.39 1.414 0l2 2zM14 4l2 2M10 8l2 2M6 12l2 2" />
              </svg>
            </button>
            
            <button
              onClick={() => handleToolChange('eraser')}
              className={`p-2 rounded-md ${currentTool === 'eraser' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100 text-gray-700'}`}
              title="Eraser"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m16 14-7 7M7.5 9.5l9 9M20 9l-5 5M6 15l3-3M14 7l3-3" />
              </svg>
            </button>
          </div>
          
          {/* Color Selection */}
          {(currentTool === 'pen' || currentTool === 'highlighter') && (
            <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
              <span className="text-sm text-gray-500 mr-1">Color:</span>
              {colorPresets.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded-full border ${
                    currentColor === color ? 'ring-2 ring-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
          
          {/* Size Controls */}
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <span className="text-sm text-gray-500">Size:</span>
            <input
              type="range"
              min="1"
              max={currentTool === 'eraser' ? "40" : currentTool === 'highlighter' ? "20" : "10"}
              value={currentSize}
              onChange={(e) => setCurrentSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-700">{currentSize}px</span>
          </div>
          
          {/* Opacity (for highlighter) */}
          {currentTool === 'highlighter' && (
            <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
              <span className="text-sm text-gray-500">Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={currentOpacity}
                onChange={(e) => setCurrentOpacity(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-700">{Math.round(currentOpacity * 100)}%</span>
            </div>
          )}
          
          {/* Edit Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo()}
              className={`p-2 rounded-md ${
                canUndo() ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h10a5 5 0 0 1 5 5v2m0-12 4 4-4 4" />
              </svg>
            </button>
            
            <button
              onClick={handleRedo}
              disabled={!canRedo()}
              className={`p-2 rounded-md ${
                canRedo() ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10H11a5 5 0 0 0-5 5v2m0-12-4 4 4 4" />
              </svg>
            </button>
            
            <button
              onClick={handleClear}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
              title="Clear Page"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
              </svg>
            </button>
            
            <button
              onClick={handleExport}
              className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              title="Save PDF"
            >
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Save PDF</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Page Controls */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
          
          <div className="text-sm">
            Page <span className="font-medium">{pageNumber}</span> of {numPages}
          </div>
          
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20 12H4" 
              />
            </svg>
          </button>
          
          <span className="text-sm font-medium w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </button>
          
          <button
            onClick={handleZoomReset}
            className="ml-2 p-2 px-3 text-sm rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Reset Zoom
          </button>
        </div>
      </div>
      
      {/* PDF Viewer */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto bg-gray-100 relative ${isPanning ? 'select-none' : ''}`}
        style={{ 
          overflow: 'auto',
          cursor: isPanning ? 'grabbing' : currentTool === 'eraser' ? 'crosshair' : 'default'
        }}
      >
        <div className="min-h-full min-w-full flex justify-center p-6">
          {/* PDF container with Canvas overlay */}
          <div 
    ref={pdfLayerRef}
    className="relative shadow-xl bg-white"
    style={{
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      border: '1px solid red' // Debug border
    }}
  >
    {/* PDF Rendering */}
    <Document
      file={file}
      onLoadSuccess={handleDocumentLoadSuccess}
      loading={<div className="animate-pulse bg-gray-200 min-h-[60vh] w-full"></div>}
    >
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={true}
        onLoadSuccess={handlePageLoadSuccess}
        loading={<div className="animate-pulse bg-gray-200 w-full aspect-[1/1.4]"></div>}
      />
    </Document>
    
    {/* Main canvas for completed annotations */}
    <canvas
      ref={mainCanvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        border: '1px solid blue' // Debug border
      }}
    />
    
    {/* Drawing canvas for active strokes */}
    <canvas
      ref={canvasRef}
      className="absolute inset-0 touch-none"
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
        border: '1px solid green' // Debug border
      }}
    />
  </div>
        </div>
      </div>
      
      {/* Save Progress Dialog */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4">Saving Annotated PDF</h3>
            
            <div className="mb-4">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${saveProgress * 100}%` }}
                />
              </div>
              <div className="text-right mt-1 text-sm text-gray-600">
                {Math.round(saveProgress * 100)}%
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Please wait while we process your annotations and create the PDF...
            </p>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow-sm text-xs text-gray-600 backdrop-blur-sm">
        <p><strong>Zoom:</strong> Ctrl+scroll or Ctrl+/- keys</p>
        <p><strong>Pan:</strong> Space+drag or middle-click drag</p>
      </div>
      
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 
                  transition-colors z-10"
          aria-label="Close PDF viewer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
    </div>
  );
}