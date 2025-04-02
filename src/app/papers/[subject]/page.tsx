'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import subjectsData from '@/lib/data/subjects.json';
import type { Subject, SubjectsData, Paper } from '@/types/subject';
import { getPaperCode } from '@/utils/paperCodes';

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subject as string;
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  // Get subject data
  const subject = (subjectsData as SubjectsData).subjects[subjectId];

  // Get unique years and normalize sessions (combine May/June)
  const { years, sessions } = useMemo(() => {
    const yearsSet = new Set<number>();
    const sessionsMap = new Map<string, Set<string>>();
    
    subject?.papers.forEach(paper => {
      yearsSet.add(paper.year);
      // Normalize May/June into a single session option
      const normalizedSession = paper.session === 'May' || paper.session === 'June' 
        ? 'May/June' 
        : paper.session;
      if (!sessionsMap.has(normalizedSession)) {
        sessionsMap.set(normalizedSession, new Set());
      }
      sessionsMap.get(normalizedSession)?.add(paper.session);
    });

    return {
      years: Array.from(yearsSet).sort((a, b) => b - a),
      sessions: Array.from(sessionsMap.keys()).sort()
    };
  }, [subject]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Subject not found</p>
      </div>
    );
  }

  // Get papers for the selected unit with filters and sort by year and session
  const getUnitPapers = (unitId: string) => {
    const sessionOrder: Record<string, number> = {
      'January': 0,
      'May': 1,
      'June': 1,
      'October': 2
    };

    return subject.papers
      .filter(paper => {
        const matchesUnit = paper.unitId === unitId;
        const matchesYear = selectedYear ? paper.year === selectedYear : true;
        const matchesSession = selectedSession ? (
          selectedSession === 'May/June' 
            ? (paper.session === 'May' || paper.session === 'June')
            : paper.session === selectedSession
        ) : true;
        return matchesUnit && matchesYear && matchesSession;
      })
      .sort((a, b) => {
        // Sort by year first (descending)
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        
        // Then by session (January, May/June, October)
        return (sessionOrder[a.session] || 0) - (sessionOrder[b.session] || 0);
      });
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedYear(null);
    setSelectedSession(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Subject Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold capitalize mb-2 text-text">
          {subject.name}
        </h1>
        <p className="text-text-muted">
          {subject.units.length} units available • Select a unit to view papers
        </p>
      </header>

      {/* Quick Filters */}
      <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Quick Filters</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Year
            </label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
              className="w-full p-2 bg-surface border border-border rounded-md 
                text-text focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Session Filter */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Session
            </label>
            <div className="flex flex-wrap gap-2">
              {sessions.map(session => (
                <button
                  key={session}
                  onClick={() => setSelectedSession(
                    selectedSession === session ? null : session
                  )}
                  className={`px-3 py-1 rounded-full text-sm transition-colors
                    ${selectedSession === session
                      ? 'bg-primary text-white'
                      : 'bg-surface-alt text-text hover:bg-surface-alt/80'
                    }`}
                >
                  {session}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                        <div>
                          <h3 className="font-medium text-text">
                            {/* Display original session name in the paper details */}
                            {paper.session} {paper.year}
                          </h3>
                          {/* Add paper code in small, muted text */}
                          {getPaperCode({
                            subject: subjectId,
                            unitId: paper.unitId,
                            year: paper.year,
                            title: paper.title
                          }) && (
                            <span className="text-xs text-text-muted">
                              {getPaperCode({
                                subject: subjectId,
                                unitId: paper.unitId,
                                year: paper.year,
                                title: paper.title
                              })}
                            </span>
                          )}
                        </div>
                      </div>

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
              )}
              
              {/* No papers message */}
              {isSelected && unitPapers.length === 0 && (
                <div className="p-4 text-center text-text-muted">
                  No papers available for this unit with selected filters
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
