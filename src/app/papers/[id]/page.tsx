'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PDFViewer from '@/components/pdf/PDFViewer';
import { Paper, Subject } from '@/types';
import { getAllSubjects } from '@/lib/data/subjectUtils';

export default function PaperPage() {
  const params = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findPaper = (paperId: string) => {
      const subjects = getAllSubjects();
      for (const subject of Object.values(subjects)) {
        const foundPaper = subject.papers.find(p => p.id === paperId);
        if (foundPaper) {
          return {
            ...foundPaper,
            subject: subject.name
          };
        }
      }
      return null;
    };

    if (params.id) {
      const foundPaper = findPaper(params.id as string);
      setPaper(foundPaper);
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading paper...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Paper not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold truncate">{paper.title}</h1>
          <p className="text-sm text-gray-500">{paper.subject}</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{paper.title}</h1>
              <p className="text-gray-500">{paper.subject}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Print
              </button>
              <a
                href={paper.pdfUrl}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="pt-16 md:pt-20">
        <PDFViewer
          paperUrl={paper.pdfUrl}
          markingSchemeUrl={paper.markingSchemeUrl}
          title={paper.title}
        />
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around p-4">
          <a
            href={paper.pdfUrl}
            download
            className="flex-1 mx-2 py-2 bg-blue-600 text-white text-center rounded-md"
          >
            Download Paper
          </a>
          <a
            href={paper.markingSchemeUrl}
            download
            className="flex-1 mx-2 py-2 bg-green-600 text-white text-center rounded-md"
          >
            Download Scheme
          </a>
        </div>
      </div>
    </div>
  );
}