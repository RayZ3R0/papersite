'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PDFViewer from '@/components/annotator/PDFViewer';

export default function AnnotateViewPage() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get('pdf');
  const title = searchParams.get('title') || 'paper';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadPDF() {
      try {
        setLoading(true);
        setError(null);

        if (!pdfUrl) {
          throw new Error('PDF URL not provided');
        }

        // Check if URL ends with .pdf
        if (!pdfUrl.toLowerCase().endsWith('.pdf')) {
          throw new Error('Invalid PDF URL');
        }

        // Fetch the PDF file
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }

        const blob = await response.blob();
        const file = new File([blob], `${title}.pdf`, { type: 'application/pdf' });
        setPdfFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    }

    loadPDF();
  }, [pdfUrl, title]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          Loading PDF...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-error flex flex-col items-center gap-4">
          <svg 
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // PDF not found state
  if (!pdfFile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-error">PDF not found</div>
      </div>
    );
  }

  // Render PDF viewer
  return (
    <div className="min-h-screen bg-background">
      <PDFViewer file={pdfFile} />
    </div>
  );
}