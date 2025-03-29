'use client';

import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import AnnotationLayer from './AnnotationLayer';
import Toolbar, { ToolType } from './Toolbar';
import annotationStore from '@/lib/annotationStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Dynamically import react-pdf to prevent SSR issues
const PDFComponents = lazy(() => import('./PDFComponents'));

interface PDFViewerProps {
  file: File;
}

interface PageDimensions {
  width: number;
  height: number;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [strokeSize, setStrokeSize] = useState(3);
  const [opacity, setOpacity] = useState(0.3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // Force remount key to trigger canvas redraw
  const [redrawKey, setRedrawKey] = useState(0);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCalculatedScale = useRef(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Handle page load and dimensions
  const onPageLoadSuccess = ({ width, height }: PageDimensions) => {
    setPageDimensions({ width, height });
    
    if (!hasCalculatedScale.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const targetWidth = containerWidth - 48; // 24px padding on each side
      const initialScale = targetWidth / width;
      setScale(initialScale);
      hasCalculatedScale.current = true;
    }
  };

  // Update undo/redo state
  const updateUndoRedoState = useCallback(() => {
    setCanUndo(annotationStore.canUndo(currentPage));
    setCanRedo(annotationStore.canRedo(currentPage));
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUndoRedoState();
  };

  // Handle undo
  const handleUndo = useCallback(() => {
    const didUndo = annotationStore.undo(currentPage);
    if (didUndo) {
      updateUndoRedoState();
      setRedrawKey(prev => prev + 1);
    }
  }, [currentPage, updateUndoRedoState]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const didRedo = annotationStore.redo(currentPage);
    if (didRedo) {
      updateUndoRedoState();
      setRedrawKey(prev => prev + 1);
    }
  }, [currentPage, updateUndoRedoState]);

  // Handle clear page
  const handleClear = useCallback(() => {
    if (window.confirm('Clear all annotations on this page?')) {
      annotationStore.clearPage(currentPage);
      updateUndoRedoState();
      setRedrawKey(prev => prev + 1);
    }
  }, [currentPage, updateUndoRedoState]);

  // Handle save
  const handleSave = useCallback(() => {
    // TODO: Implement PDF saving with annotations
    console.log('Save functionality coming soon');
  }, []);

  // Update tool settings when changed
  useEffect(() => {
    // Apply default settings for tool when changing tools
    if (currentTool === 'pen') {
      setStrokeSize(3);
      setOpacity(1.0);
    } else if (currentTool === 'highlighter') {
      setStrokeSize(20);
      setOpacity(0.3);
    } else if (currentTool === 'eraser') {
      setStrokeSize(20);
      setOpacity(1.0);
    }
  }, [currentTool]);

  // Update undo/redo state after strokes change
  useEffect(() => {
    const interval = setInterval(updateUndoRedoState, 200);
    return () => clearInterval(interval);
  }, [updateUndoRedoState]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !pageDimensions) return;
      if (hasCalculatedScale.current) return; // Don't auto-scale after manual zoom

      const containerWidth = containerRef.current.clientWidth;
      const targetWidth = containerWidth - 48;
      setScale(targetWidth / pageDimensions.width);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageDimensions]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            setCurrentTool('pen');
            break;
          case 'h':
            setCurrentTool('highlighter');
            break;
          case 'e':
            setCurrentTool('eraser');
            break;
        }
      }

      // Undo/Redo shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Handle zoom controls
  const handleZoom = (delta: number) => {
    setScale(current => {
      const newScale = Math.max(0.5, Math.min(2, current + delta));
      hasCalculatedScale.current = true; // Prevent auto-scaling after manual zoom
      return newScale;
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-border">
        {/* Page Navigation */}
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded hover:bg-surface-alt disabled:opacity-50
              disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm whitespace-nowrap">
            Page {currentPage} of {numPages || '?'}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className="p-2 rounded hover:bg-surface-alt disabled:opacity-50
              disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 rounded hover:bg-surface-alt transition-colors"
            aria-label="Zoom out"
          >
            Zoom Out
          </button>
          <span className="text-sm w-20 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 rounded hover:bg-surface-alt transition-colors"
            aria-label="Zoom in"
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-surface-alt/50 relative touch-pan-y"
      >
        <div className="min-h-full w-full flex justify-center p-6">
          <div className="relative bg-white shadow-lg">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh] bg-surface-alt animate-pulse">
                Loading PDF...
              </div>
            }>
              <PDFComponents
                file={file}
                currentPage={currentPage}
                scale={scale}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onPageLoadSuccess={onPageLoadSuccess}
              />
            </Suspense>

            {/* Drawing Layer */}
            {pageDimensions && scale && (
              <div className="absolute inset-0" key={redrawKey}>
                <AnnotationLayer
                  width={pageDimensions.width}
                  height={pageDimensions.height}
                  scale={scale}
                  pageNumber={currentPage}
                  color={currentColor}
                  size={strokeSize}
                  tool={currentTool}
                  opacity={opacity}
                  onPressureChange={pressure => console.log('Pressure:', pressure)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Toolbar - Position based on screen size */}
        <div className={`
          fixed z-50
          ${isMobile 
            ? 'bottom-4 left-1/2 -translate-x-1/2' 
            : 'top-24 left-4'
          }
        `}>
          <Toolbar
            currentTool={currentTool}
            currentColor={currentColor}
            currentSize={strokeSize}
            currentOpacity={opacity}
            onToolChange={setCurrentTool}
            onColorChange={setCurrentColor}
            onSizeChange={setStrokeSize}
            onOpacityChange={setOpacity}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onSave={handleSave}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      </div>
    </div>
  );
}