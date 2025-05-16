'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFComponentsProps {
  file: File;
  currentPage: number;
  scale: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onPageLoadSuccess: ({ width, height }: { width: number; height: number }) => void;
}

export default function PDFComponents({
  file,
  currentPage,
  scale,
  onDocumentLoadSuccess,
  onPageLoadSuccess
}: PDFComponentsProps) {
  return (
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
  );
}