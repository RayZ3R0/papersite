'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getLatestPapers } from '@/lib/data/latestPapers';

export default function LatestPapersPage() {
  const latestPapers = getLatestPapers();
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  
  // Group papers by subject
  const papersBySubject = latestPapers.reduce((acc, paper) => {
    const subjectPapers = acc[paper.subjectName] || [];
    return {
      ...acc,
      [paper.subjectName]: [...subjectPapers, paper]
    };
  }, {} as Record<string, typeof latestPapers>);

  // Get session info from first paper (they're all from same session)
  const sessionInfo = latestPapers[0] ? 
    `${latestPapers[0].session} ${latestPapers[0].year}` : 
    'No papers available';

  // Toggle subject expansion
  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  // Check if a subject is expanded
  const isSubjectExpanded = (subject: string) => {
    return expandedSubjects[subject] ?? true; // Default to expanded
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
          Latest Papers
        </h1>
        <p className="text-text-muted">
          Papers from {sessionInfo}
        </p>
      </header>

      {/* Papers by Subject */}
      <div className="space-y-4">
        {Object.entries(papersBySubject).map(([subjectName, papers]) => (
          <section key={subjectName} className="bg-surface rounded-lg border border-border">
            {/* Subject Header - Always visible */}
            <button
              onClick={() => toggleSubject(subjectName)}
              className="w-full p-4 border-b border-border flex items-center justify-between 
                hover:bg-surface-alt transition-colors"
            >
              <div>
                <h2 className="text-xl font-semibold text-text">
                  {subjectName}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {papers.length} {papers.length === 1 ? 'paper' : 'papers'} available
                </p>
              </div>
              <div className="transform transition-transform duration-200" 
                style={{ transform: isSubjectExpanded(subjectName) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg 
                  className="w-5 h-5 text-text-muted" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </div>
            </button>

            {/* Papers List - Collapsible */}
            <div 
              className={`overflow-hidden transition-all duration-200 ease-in-out
                ${isSubjectExpanded(subjectName) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="divide-y divide-border">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-4 hover:bg-surface-alt transition-colors"
                  >
                    <h3 className="font-medium text-text mb-3">
                      {paper.title}
                    </h3>
                    
                    {/* Paper and Marking Scheme */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 
                          bg-primary text-white rounded-lg hover:opacity-90 
                          transition-colors shadow-sm hover:shadow"
                      >
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        Question Paper
                      </a>
                      <a
                        href={paper.markingSchemeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 
                          bg-secondary text-white rounded-lg hover:opacity-90 
                          transition-colors shadow-sm hover:shadow"
                      >
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                          />
                        </svg>
                        Marking Scheme
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}