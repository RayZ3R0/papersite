'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import subjectsData from '@/lib/data/subjects.json';
import PDFViewer from '@/components/annotator/PDFViewer';
import type { SubjectsData, Paper } from '@/types/subject';

export default function AnnotateViewPage() {
  const params = useParams();
  const paperId = params.paperId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadPDF() {
      try {
        setLoading(true);
        setError(null);

        // Find paper in subjects data
        const paper = findPaperById(paperId);
        if (!paper) {
          throw new Error('Paper not found');
        }

        // Check if URL ends with .pdf
        if (!paper.pdfUrl.toLowerCase().endsWith('.pdf')) {
          throw new Error('Invalid PDF URL');
        }

        // Fetch the PDF file
        const response = await fetch(paper.pdfUrl);
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }

        const blob = await response.blob();
        const file = new File([blob], `${paper.title}.pdf`, { type: 'application/pdf' });
        setPdfFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    }

    loadPDF();
  }, [paperId]);

  // Helper function to find paper by ID
  function findPaperById(id: string): Paper | null {
    const subjects = (subjectsData as unknown as SubjectsData).subjects;
    
    for (const subject of Object.values(subjects)) {
      const paper = subject.papers.find(p => p.id === id);
      if (paper) return paper;
    }
    
    return null;
  }

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