'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Subject, Paper } from '@/types/subject';

interface AnnotateSubjectListProps {
  subjects: Record<string, Subject>;
  selectedSubject: string | null;
  onSubjectSelect: (id: string | null) => void;
}

export default function AnnotateSubjectList({
  subjects,
  selectedSubject,
  onSubjectSelect,
}: AnnotateSubjectListProps) {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Toggle unit expansion
  const toggleUnit = (subjectId: string, unitId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [`${subjectId}-${unitId}`]: !prev[`${subjectId}-${unitId}`]
    }));
  };

  // Filter valid papers (with .pdf URLs) and sort them
  const getUnitPapers = (papers: Paper[], unitId: string) => {
    return papers
      .filter(paper => 
        paper.pdf_url.toLowerCase().endsWith('.pdf') && 
        paper.unit_id === unitId
      )
      .sort((a, b) => {
        // First sort by year (descending)
        if (a.year !== b.year) {
          return b.year - a.year;
        }

        // Then by session (Oct -> May/June -> Jan)
        const sessionOrder: Record<string, number> = {
          'October': 3,
          'May': 2,
          'June': 2,
          'January': 1
        };

        return (sessionOrder[b.session] || 0) - (sessionOrder[a.session] || 0);
      });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Expanded Subject */}
      {selectedSubject && (
        <div
          className="bg-surface rounded-lg border border-primary 
            transition-colors overflow-hidden"
        >
          {/* Subject Header */}
          <button
            onClick={() => onSubjectSelect(null)}
            className="w-full p-4 text-left transition-colors bg-primary/10"
          >
            <h3 className="font-medium text-text">
              {subjects[selectedSubject].name}
            </h3>
            <p className="text-sm text-text-muted mt-1">
              {subjects[selectedSubject].units.length} units
            </p>
          </button>

          {/* Units List */}
          <div className="divide-y divide-border">
            {subjects[selectedSubject].units.map(unit => {
              const unitPapers = getUnitPapers(
                subjects[selectedSubject].papers,
                unit.id
              );
              const isExpanded = expandedUnits[`${selectedSubject}-${unit.id}`];

              return (
                <div key={unit.id} className="bg-surface">
                  <button
                    onClick={() => toggleUnit(selectedSubject, unit.id)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-alt
                      transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-text">
                        {unit.name}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {unitPapers.length} papers
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-text-muted transition-transform
                        ${isExpanded ? 'rotate-180' : ''}`}
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
                  </button>

                  {/* Papers List */}
                  {isExpanded && unitPapers.length > 0 && (
                    <div className="bg-surface-alt/50 px-4 py-2 space-y-2">
                      {unitPapers.map(paper => (
                        <div
                          key={paper.id}
                          className="flex items-center justify-between p-2 
                            hover:bg-surface-alt rounded-lg transition-colors"
                        >
                          <span className="text-sm text-text">
                            {paper.session} {paper.year}
                            {paper.unit_code && (
                              <span className="ml-2 text-sm text-text-muted">
                                {paper.unit_code}
                              </span>
                            )}
                          </span>
                          <a
                            href={`/annotate/view/paper?pdf=${encodeURIComponent(paper.pdf_url)}&title=${encodeURIComponent(`${paper.session} ${paper.year}${paper.unit_code ? ` ${paper.unit_code}` : ''}`)}`}
                            className="px-4 py-1 text-sm font-medium rounded-full
                              bg-primary text-white hover:opacity-90 
                              transition-colors shadow-sm hover:shadow"
                          >
                            Annotate
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(subjects).map(([id, subject]) => {
          if (selectedSubject === id) {
            return null; // Skip if this subject is expanded
          }

          const validPapers = subject.papers.filter(p => 
            p.pdf_url.toLowerCase().endsWith('.pdf')
          );

          return (
            <div
              key={id}
              className="bg-surface rounded-lg border border-border 
                hover:border-border-hover transition-colors overflow-hidden"
            >
              <button
                onClick={() => onSubjectSelect(id)}
                className="w-full p-4 text-left hover:bg-surface-alt 
                  transition-colors"
              >
                <h3 className="font-medium text-text">{subject.name}</h3>
                <p className="text-sm text-text-muted mt-1">
                  {subject.units.length} units • {validPapers.length} papers
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}