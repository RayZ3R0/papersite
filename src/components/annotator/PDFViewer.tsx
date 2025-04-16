import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Toolbar from './Toolbar2';
import ViewportController from './ViewportController';
import AnnotationCanvas from './AnnotationCanvas';
import SaveDialog from './SaveDialog';
import PDFExporter from './PDFExporter';
import { usePDFAnnotations } from '@/hooks/usePDFAnnotations';
import type { ViewportState, PDFPageInfo, ToolState, ToolType } from '@/types/annotator';

// Worker config for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
  onClose?: () => void;
}

export default function PDFViewer({ file, onClose }: PDFViewerProps) {
  // Central viewport state - single source of truth for positioning
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
    pageNumber: 1,
    numPages: 0
  });
  
  // Store page info for each PDF page
  const [pdfPageInfo, setPdfPageInfo] = useState<Record<number, PDFPageInfo>>({});
  
  // Tool state
  const [toolState, setToolState] = useState<ToolState>({
    activeTool: 'pen',
    color: '#000000',
    size: 2,
    opacity: 1
  });
  
  // Add this state for tracking panning
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  // Refs for container and PDF elements
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfLayerRef = useRef<HTMLDivElement>(null);
  
  // Save/export state
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  
  // PDF annotation hook for centralized annotation management
  const { 
    annotations,
    addStroke,
    updateStroke,
    finalizeStroke,
    clearPage,
    undo,
    redo,
    canUndo,
    canRedo
  } = usePDFAnnotations();
  
  // Handle PDF document load
  const handleDocumentLoad = useCallback(({ numPages }: { numPages: number }) => {
    setViewport(prev => ({ ...prev, numPages }));
  }, []);
  
  // CRITICAL IMPROVEMENT: Use PDF.js viewport to get accurate scale and coordinates
  const handlePageLoad = useCallback(
    ({ 
      width, 
      height, 
      originalWidth, 
      originalHeight,
      originalScale,
      rotation,
      _pageIndex
    }: any) => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 48; // account for padding
      const containerHeight = container.clientHeight - 48;
      
      // Calculate scale to fit either width or height, whichever is more constraining
      const scaleWidth = containerWidth / width;
      const scaleHeight = containerHeight / height;
      const scaleToFit = Math.min(scaleWidth, scaleHeight, 1.0); // Don't scale up past 100%
      
      // Store the page information including PDF dimensions
      // originalWidth/Height are in PDF units (points, 1/72 inch)
      const pageNumber = _pageIndex + 1;
      const userUnit = width / originalWidth; // User unit is the scaling from PDF points to displayed units
      
      setPdfPageInfo(prev => ({
        ...prev, 
        [pageNumber]: {
          width: originalWidth,
          height: originalHeight,
          userUnit,
          viewportScale: originalScale,
          rotation
        }
      }));
      
      setViewport(prev => ({
        ...prev,
        width,
        height,
        scale: scaleToFit,
        // Center the page
        offsetX: (containerWidth - (width * scaleToFit)) / 2,
        offsetY: (containerHeight - (height * scaleToFit)) / 2,
      }));
    }, 
    []
  );
  
  // Synchronized zoom that maintains viewport relationships
  const handleZoom = useCallback((newScale: number) => {
    setViewport(prev => {
      // Make sure scale is within reasonable bounds
      const safeScale = Math.max(0.1, Math.min(4, newScale));
      
      if (!containerRef.current) return prev;
      
      // Get the container's visible area (accounting for scroll position)
      const container = containerRef.current;
      const visibleWidth = container.clientWidth;
      const visibleHeight = container.clientHeight;
      
      // Calculate center of the visible viewport area
      const viewportCenterX = container.scrollLeft + (visibleWidth / 2);
      const viewportCenterY = container.scrollTop + (visibleHeight / 2);
      
      // Calculate relative position within the PDF (0-1)
      const pdfRelativeX = viewportCenterX / (prev.width * prev.scale);
      const pdfRelativeY = viewportCenterY / (prev.height * prev.scale);
      
      // Apply the new scale
      const newWidth = prev.width * safeScale;
      const newHeight = prev.height * safeScale;
      
      // Calculate new scroll position to maintain the same center point
      const newScrollLeft = (pdfRelativeX * newWidth) - (visibleWidth / 2);
      const newScrollTop = (pdfRelativeY * newHeight) - (visibleHeight / 2);
      
      // Schedule scroll update after render
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = newScrollLeft;
          containerRef.current.scrollTop = newScrollTop;
        }
      }, 0);
      
      return {
        ...prev,
        scale: safeScale,
      };
    });
  }, []);
  
  // Page navigation
  const handlePageChange = useCallback((pageNumber: number) => {
    setViewport(prev => ({
      ...prev,
      pageNumber: Math.max(1, Math.min(prev.numPages, pageNumber))
    }));
  }, []);
  
  // Tool change handlers
  const handleToolChange = useCallback((tool: ToolType) => {
    setToolState(prev => ({ ...prev, activeTool: tool }));
  }, []);
  
  const handleColorChange = useCallback((color: string) => {
    setToolState(prev => ({ ...prev, color }));
  }, []);
  
  const handleSizeChange = useCallback((size: number) => {
    setToolState(prev => ({ ...prev, size }));
  }, []);
  
  const handleOpacityChange = useCallback((opacity: number) => {
    setToolState(prev => ({ ...prev, opacity }));
  }, []);
  
  // Export annotated PDF
  const handleExport = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveProgress(0.05);
      
      // Use the PDF exporter with page info
      const exporter = new PDFExporter(file, pdfPageInfo, annotations);
      const blob = await exporter.export((progress) => {
        setSaveProgress(progress);
      });
      
      // Download the annotated PDF
      const fileName = file.name.replace('.pdf', '_annotated.pdf');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      setIsSaving(false);
    } catch (error) {
      console.error('PDF export failed:', error);
      setIsSaving(false);
      alert('Failed to save PDF. Please try again.');
    }
  }, [file, pdfPageInfo, annotations]);
  
  // IMPROVED: Add panning functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      // Only start panning on middle mouse button (wheel click) or when space is held
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
    
    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Handle space key for pan mode
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
  
  // IMPROVED: Add mousewheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Zoom with Ctrl+wheel
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -Math.sign(e.deltaY) * 0.1;
        handleZoom(viewport.scale + delta);
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [viewport.scale, handleZoom]);
  
  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Page navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        handlePageChange(viewport.pageNumber + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        handlePageChange(viewport.pageNumber - 1);
      }
      
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        handleZoom(viewport.scale + 0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoom(viewport.scale - 0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoom(1);
      }
      
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo(viewport.pageNumber)) redo(viewport.pageNumber);
        } else {
          if (canUndo(viewport.pageNumber)) undo(viewport.pageNumber);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewport.pageNumber, viewport.scale, handlePageChange, handleZoom, canUndo, canRedo, undo, redo]);
  
  // Get current page info
  const currentPageInfo = pdfPageInfo[viewport.pageNumber];
  
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Annotation toolbar */}
      <Toolbar
        currentTool={toolState.activeTool}
        currentColor={toolState.color}
        currentSize={toolState.size}
        currentOpacity={toolState.opacity}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onSizeChange={handleSizeChange}
        onOpacityChange={handleOpacityChange}
        canUndo={canUndo(viewport.pageNumber)}
        canRedo={canRedo(viewport.pageNumber)}
        onUndo={() => undo(viewport.pageNumber)}
        onRedo={() => redo(viewport.pageNumber)}
        onClear={() => clearPage(viewport.pageNumber)}
        onSave={handleExport}
      />
      
      {/* Page controls */}
      <ViewportController
        pageNumber={viewport.pageNumber}
        numPages={viewport.numPages}
        scale={viewport.scale}
        onPageChange={handlePageChange}
        onZoomIn={() => handleZoom(viewport.scale + 0.1)}
        onZoomOut={() => handleZoom(viewport.scale - 0.1)}
        onZoomReset={() => handleZoom(1)}
      />
      
      {/* IMPROVED: Main PDF view area with better scrolling */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto bg-gray-100 relative ${isPanning ? 'select-none' : ''}`}
        style={{ 
          overflow: 'auto',
          cursor: isPanning ? 'grabbing' : 'default'
        }}
      >
        <div className="min-h-full min-w-full flex justify-center p-6">
          {/* PDF container with synchronized layers */}
          <div 
            ref={pdfLayerRef}
            className="relative shadow-xl bg-white"
            style={{
              width: currentPageInfo ? 
                `${currentPageInfo.width * viewport.scale}px` : 'auto',
              height: currentPageInfo ? 
                `${currentPageInfo.height * viewport.scale}px` : 'auto',
              margin: '0 auto', // Center horizontally
            }}
          >
            {/* PDF document layer */}
            <Document
              file={file}
              onLoadSuccess={handleDocumentLoad}
              loading={<div className="animate-pulse bg-gray-200 min-h-[60vh] w-full"></div>}
            >
              <Page
                pageNumber={viewport.pageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                onLoadSuccess={handlePageLoad}
                loading={<div className="animate-pulse bg-gray-200 w-full aspect-[1/1.4]"></div>}
                scale={1} // Keep scale at 1, we handle scaling with CSS transform
              />
            </Document>
            
            {/* Annotation canvas positioned absolutely over the PDF */}
            {currentPageInfo && (
              <div 
                className="absolute inset-0"
                style={{ 
                  pointerEvents: isPanning ? 'none' : 'auto', // Disable interactions during panning
                }}
              >
                <AnnotationCanvas
                  viewport={viewport}
                  pageInfo={currentPageInfo}
                  toolState={toolState}
                  annotations={annotations[viewport.pageNumber] || []}
                  onStrokeStart={(stroke) => addStroke(viewport.pageNumber, stroke)}
                  onStrokeUpdate={(stroke) => updateStroke(viewport.pageNumber, stroke)}
                  onStrokeComplete={(stroke) => finalizeStroke(viewport.pageNumber, stroke)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save progress dialog */}
      {isSaving && (
        <SaveDialog progress={saveProgress} onCancel={() => setIsSaving(false)} />
      )}
      
      {/* Instructions tooltip (new) */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow-sm text-xs text-gray-600 backdrop-blur-sm">
        <p><strong>Zoom:</strong> Ctrl+scroll or Ctrl+/- keys</p>
        <p><strong>Pan:</strong> Space+drag or middle-click drag</p>
      </div>
      
      {/* Close button if needed */}
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