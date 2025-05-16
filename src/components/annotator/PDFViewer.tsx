'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import AnnotationLayer from './AnnotationLayer';
import Toolbar from './Toolbar';
import SaveProgress from './SaveProgress';
import type { ToolType, Stroke } from '@/lib/annotationStore';
import annotationStore from '@/lib/annotationStore';
import PDFSaver from './PDFSaver';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
}

interface PageDimensions {
  width: number;
  height: number;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  // PDF state
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null);
  
  // Tool settings
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState(() => annotationStore.getToolSettings('pen').color);
  const [strokeSize, setStrokeSize] = useState(() => annotationStore.getToolSettings('pen').size);
  const [opacity, setOpacity] = useState(() => annotationStore.getToolSettings('pen').opacity);

  // Undo/Redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Force remount key to trigger canvas redraw
  const [redrawKey, setRedrawKey] = useState(0);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCalculatedScale = useRef(false);

  // Initialize tool settings from store
  useEffect(() => {
    const settings = annotationStore.getToolSettings(currentTool);
    setStrokeSize(settings.size);
    setOpacity('opacity' in settings ? settings.opacity : 1);
    if ('color' in settings) {
      setCurrentColor(settings.color);
    }
  }, [currentTool]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Handle page load and dimensions
  const onPageLoadSuccess = useCallback(({ width, height }: PageDimensions) => {
    setPageDimensions({ width, height });
    
    if (!hasCalculatedScale.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const targetWidth = containerWidth - 48;
      const initialScale = targetWidth / width;
      setScale(initialScale);
      hasCalculatedScale.current = true;
    }
  }, []);

  // Update undo/redo state
  const updateUndoRedoState = useCallback(() => {
    setCanUndo(annotationStore.canUndo(currentPage));
    setCanRedo(annotationStore.canRedo(currentPage));
  }, [currentPage]);

  // Handle tool change with settings
  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool);
    const settings = annotationStore.getToolSettings(tool);
    setStrokeSize(settings.size);
    setOpacity('opacity' in settings ? settings.opacity : 1);
    if ('color' in settings) {
      setCurrentColor(settings.color);
    }
  }, []);

  // Handle settings updates
  const handleColorChange = useCallback((color: string) => {
    if (currentTool === 'eraser') return;
    setCurrentColor(color);
    annotationStore.updateToolSettings(currentTool, { color });
  }, [currentTool]);

  const handleSizeChange = useCallback((size: number) => {
    setStrokeSize(size);
    annotationStore.updateToolSettings(currentTool, { size });
  }, [currentTool]);

  const handleOpacityChange = useCallback((value: number) => {
    if (currentTool === 'highlighter') {
      setOpacity(value);
      annotationStore.updateToolSettings('highlighter', { opacity: value });
    }
  }, [currentTool]);

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

  // Save progress state
  const [saveProgress, setSaveProgress] = useState({
    isVisible: false,
    currentPage: 0,
    totalPages: 0,
    status: ''
  });

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setSaveProgress({
        isVisible: true,
        currentPage: 0,
        totalPages: numPages,
        status: 'Preparing to save...'
      });
  
      const saver = new PDFSaver(file, scale);
      const annotationsMap = new Map<number, Stroke[]>();
      
      // Get annotations for all pages
      for (let i = 1; i <= numPages; i++) {
        const strokes = annotationStore.getStrokes(i);
        if (strokes.length > 0) {
          annotationsMap.set(i, strokes);
        }
      }

      // Save PDF with annotations
      const blob = await saver.save(annotationsMap, (progress) => {
        setSaveProgress({
          isVisible: true,
          currentPage: progress.currentPage,
          totalPages: progress.totalPages,
          status: progress.status
        });
      });

      // Reset progress and download file
      setSaveProgress(prev => ({ ...prev, status: 'Download starting...' }));
      const fileName = file instanceof File ? file.name : 'annotated.pdf';
      const newName = fileName.replace('.pdf', '_annotated.pdf');
      PDFSaver.downloadBlob(blob, newName);
      
      // Hide progress after a brief delay
      setTimeout(() => {
        setSaveProgress(prev => ({ ...prev, isVisible: false }));
      }, 500);
    } catch (error) {
      console.error('Error saving PDF:', error);
      setSaveProgress(prev => ({
        ...prev,
        status: 'Failed to save PDF. Please try again.'
      }));
      setTimeout(() => {
        setSaveProgress(prev => ({ ...prev, isVisible: false }));
      }, 2000);
    }
  }, [file, numPages]);

  // Update undo/redo state after strokes change
  useEffect(() => {
    const interval = setInterval(updateUndoRedoState, 100);
    return () => clearInterval(interval);
  }, [updateUndoRedoState]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !pageDimensions) return;
      if (hasCalculatedScale.current) return;

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
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tool shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            handleToolChange('pen');
            break;
          case 'h':
            handleToolChange('highlighter');
            break;
          case 'e':
            handleToolChange('eraser');
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
  }, [handleUndo, handleRedo, handleToolChange]);

  // Handle zoom controls
  const handleZoom = (delta: number) => {
    setScale(current => {
      const newScale = Math.max(0.5, Math.min(2, current + delta));
      hasCalculatedScale.current = true;
      return newScale;
    });
  };

  return (
    <>
      <div className="flex flex-col h-full bg-surface">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded hover:bg-surface-alt disabled:opacity-50
                disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              className="p-2 rounded hover:bg-surface-alt disabled:opacity-50
                disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 rounded hover:bg-surface-alt transition-colors"
            >
              Zoom Out
            </button>
            <span className="text-sm w-20 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 rounded hover:bg-surface-alt transition-colors"
            >
              Zoom In
            </button>
          </div>
        </div>

        {/* PDF Document */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto bg-surface-alt/50"
        >
          <div className="min-h-full w-full flex justify-center p-6">
            <div className="relative bg-white shadow-lg">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center min-h-[60vh]">
                    Loading PDF...
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                  loading={
                    <div className="w-full aspect-[1/1.414] bg-surface-alt animate-pulse" />
                  }
                />
              </Document>

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
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar rendered at root level */}
      <Toolbar
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onSizeChange={handleSizeChange}
        onOpacityChange={handleOpacityChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
        canUndo={canUndo}
        canRedo={canRedo}
        currentTool={currentTool}
        currentColor={currentColor}
        currentSize={strokeSize}
        currentOpacity={opacity}
        initiallyVisible={true}
      />

      {/* Save Progress Modal */}
      <SaveProgress
        currentPage={saveProgress.currentPage}
        totalPages={saveProgress.totalPages}
        status={saveProgress.status}
        isVisible={saveProgress.isVisible}
      />
    </>
  );
}
