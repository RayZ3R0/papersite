'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import('@/components/annotator/PDFViewer'),
  { ssr: false }
);

export default function AnnotatePage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)]"> {/* Subtract navbar height */}
      {!file ? (
        // Upload section
        <div className="max-w-xl mx-auto h-full flex items-center justify-center">
          <div className="w-full p-8 border-2 border-dashed border-border rounded-xl bg-surface">
            <h1 className="text-2xl font-bold mb-6 text-text text-center">
              Upload PDF to Annotate
            </h1>
            
            {/* File Input */}
            <div className="flex flex-col items-center">
              <label className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="px-6 py-3 rounded-lg bg-primary text-white
                  transition-all duration-200
                  hover:bg-primary/90 active:scale-95"
                >
                  Choose PDF File
                </div>
                <p className="mt-2 text-sm text-text-muted text-center">
                  or drag and drop here
                </p>
              </label>
            </div>
          </div>
        </div>
      ) : (
        // PDF Viewer section
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
            <h1 className="text-xl font-semibold text-text truncate flex-1 mr-4">
              {file.name}
            </h1>
            <button
              onClick={() => setFile(null)}
              className="px-4 py-2 text-sm text-text-muted hover:text-text
                transition-colors whitespace-nowrap"
            >
              Upload Different File
            </button>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 min-h-0">
            <PDFViewer file={file} />
          </div>
        </div>
      )}
    </div>
  );
}
