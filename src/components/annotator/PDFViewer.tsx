'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import AnnotationLayer from './AnnotationLayer';
import Toolbar from './Toolbar';
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
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeSize, setStrokeSize] = useState(5);
  
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
      <div className="flex items-center justify-between p-4 border-b border-border">
        {/* Page Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="p-2 rounded hover:bg-surface-alt disabled:opacity-50
              disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        {/* Zoom Controls */}
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
        className="flex-1 overflow-auto bg-surface-alt/50 relative"
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

            {/* Drawing Layer */}
            {pageDimensions && scale && (
              <div className="absolute inset-0">
                <AnnotationLayer
                  width={pageDimensions.width}
                  height={pageDimensions.height}
                  scale={scale}
                  pageNumber={currentPage}
                  color={currentColor}
                  size={strokeSize}
                  onPressureChange={pressure => console.log('Pressure:', pressure)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <Toolbar
          onColorChange={setCurrentColor}
          onSizeChange={setStrokeSize}
        />
      </div>
    </div>
  );
}
