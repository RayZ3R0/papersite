'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import subjectsData from '@/lib/data/subjects.json';
import type { Subject, SubjectsData } from '@/types/subject';

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // Get subject data
  const subject = (subjectsData as SubjectsData).subjects[subjectId];

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Subject not found</p>
      </div>
    );
  }

  // Get papers for the selected unit
  const getUnitPapers = (unitId: string) => {
    return subject.papers.filter(paper => paper.unitId === unitId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Subject Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold capitalize mb-2 text-text">
          {subject.name}
        </h1>
        <p className="text-text-muted">
          {subject.units.length} units available • Select a unit to view papers
        </p>
      </header>

      {/* Vertical layout */}
      <div className="space-y-6">
        {subject.units.map((unit) => {
          const unitPapers = getUnitPapers(unit.id);
          const isSelected = selectedUnit === unit.id;
          
          return (
            <div
              key={unit.id}
              className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden"
            >
              {/* Unit Header */}
              <button
                onClick={() => {
                  setSelectedUnit(isSelected ? null : unit.id);
                }}
                className="w-full p-4 text-left bg-surface hover:bg-surface-alt 
                  transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text">
                    {unit.name}
                  </h2>
                  <span className="text-sm text-text-muted ml-4">
                    {unitPapers.length} papers
                  </span>
                </div>
                {unit.description && (
                  <p className="text-sm text-text-muted mt-1">{unit.description}</p>
                )}
              </button>

              {/* Papers List - Only show if selected and has papers */}
              {isSelected && unitPapers.length > 0 && (
                <div className="divide-y divide-border">
                  {unitPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 hover:bg-surface-alt transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-text">
                          {paper.session} {paper.year}
                        </h3>
                      </div>
                      
                      {/* Paper and Marking Scheme */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-3 
                            bg-primary text-white rounded-lg hover:opacity-90 
                            transition-colors shadow-sm hover:shadow
                            dark:bg-primary dark:text-white dark:hover:bg-primary-dark"
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
                            transition-colors shadow-sm hover:shadow
                            dark:bg-secondary dark:text-white dark:hover:bg-secondary-dark"
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
              )}
              
              {/* No papers message */}
              {isSelected && unitPapers.length === 0 && (
                <div className="p-4 text-center text-text-muted">
                  No papers available for this unit
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}