import { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import '@/styles/annotator.css';
import { Tool, PageAnnotations, PDFViewerProps } from '@/types/annotator';
import AnnotationLayer from './AnnotationLayer';
import Toolbar from './Toolbar';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  
  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [penColor, setPenColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  
  // Page dimensions
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });
  
  // Store annotations for each page
  const [annotations, setAnnotations] = useState<Record<number, PageAnnotations>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageLoadSuccess = useCallback(({ width, height }: { width: number; height: number }) => {
    setPageDimensions({ width, height });
  }, []);

  const handleAnnotationChange = useCallback((pageAnnotations: PageAnnotations) => {
    setAnnotations(prev => ({
      ...prev,
      [pageAnnotations.pageNumber]: pageAnnotations
    }));
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="h-full flex flex-col bg-background" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex-1">
          <Toolbar
            activeTool={activeTool}
            penColor={penColor}
            strokeWidth={strokeWidth}
            onToolChange={setActiveTool}
            onColorChange={setPenColor}
            onStrokeWidthChange={setStrokeWidth}
          />
        </div>
        
        {/* Page Controls */}
        <div className="flex items-center gap-4 mx-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="tool-button"
            title="Previous Page"
          >
            ←
          </button>
          <span className="text-sm">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages}
            className="tool-button"
            title="Next Page"
          >
            →
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="tool-button"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-sm min-w-[4ch] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="tool-button"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleRotate}
            className="tool-button"
            title="Rotate"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto p-4">
        <Document
          file={file}
          onLoadSuccess={handleDocumentLoadSuccess}
          className="mx-auto"
          loading={
            <div className="flex items-center justify-center h-32">
              Loading PDF...
            </div>
          }
          error={
            <div className="flex items-center justify-center h-32 text-error">
              Failed to load PDF. Please try again.
            </div>
          }
        >
          <div className="relative shadow-lg mx-auto">
            <Page
              pageNumber={currentPage}
              scale={scale}
              rotate={rotation}
              className="bg-white"
              onLoadSuccess={handlePageLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-32">
                  Loading page...
                </div>
              }
              error={
                <div className="flex items-center justify-center h-32 text-error">
                  Failed to load page.
                </div>
              }
            />
            <AnnotationLayer
              pageNumber={currentPage}
              scale={scale}
              rotation={rotation}
              width={pageDimensions.width}
              height={pageDimensions.height}
              onAnnotationChange={handleAnnotationChange}
              activeTool={{
                type: activeTool,
                color: penColor,
                width: strokeWidth,
                opacity: 1
              }}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}