'use client';

import { useState, useMemo } from 'react';
import subjectsData from '@/lib/data/subjects.json';
import type { SubjectsData, Subject, Paper } from '@/types/subject';
import AnnotateSearchBox from '@/components/annotate-select/AnnotateSearchBox';
import AnnotateFilterDropdown from '@/components/annotate-select/AnnotateFilterDropdown';
import AnnotateSubjectList from '@/components/annotate-select/AnnotateSubjectList';
import { useAnnotateSearch } from '@/hooks/useAnnotateSearch';

export default function AnnotateSelectPage() {
  const subjects = (subjectsData as unknown as SubjectsData).subjects;
  
  // Search state
  const {
    query,
    parsedQuery,
    formattedQuery,
    results,
    suggestions,
    isSearching,
    updateSearch,
    clearSearch
  } = useAnnotateSearch(subjectsData as unknown as SubjectsData);

  // Subject selection state
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Get unique years and sessions from valid papers
  const { yearOptions, sessionOptions } = useMemo(() => {
    const years = new Set<number>();
    const sessions = new Set<string>();

    Object.values(subjects).forEach(subject => {
      subject.papers.forEach(paper => {
        if (paper.pdfUrl.toLowerCase().endsWith('.pdf')) {
          years.add(paper.year);
          sessions.add(paper.session);
        }
      });
    });

    return {
      yearOptions: Array.from(years)
        .sort((a, b) => b - a)
        .map(year => ({
          id: year.toString(),
          label: year.toString(),
          count: Object.values(subjects).reduce((acc, subject) => 
            acc + subject.papers.filter(p => 
              p.year === year && p.pdfUrl.toLowerCase().endsWith('.pdf')
            ).length, 0
          ),
        })),
      sessionOptions: Array.from(sessions)
        .sort()
        .map(session => ({
          id: session,
          label: session,
          count: Object.values(subjects).reduce((acc, subject) => 
            acc + subject.papers.filter(p => 
              p.session === session && p.pdfUrl.toLowerCase().endsWith('.pdf')
            ).length, 0
          ),
        })),
    };
  }, [subjects]);

  // Filter subjects based on year/session when not searching
  const filteredSubjects = useMemo(() => {
    if (query) return subjects; // Don't filter when searching

    const filtered: Record<string, Subject> = {};

    Object.entries(subjects).forEach(([id, subject]) => {
      const validPapers = subject.papers.filter(paper => {
        if (!paper.pdfUrl.toLowerCase().endsWith('.pdf')) return false;
        if (selectedYear && paper.year.toString() !== selectedYear) return false;
        if (selectedSession && paper.session !== selectedSession) return false;
        return true;
      });

      if (validPapers.length > 0) {
        filtered[id] = {
          ...subject,
          papers: validPapers
        };
      }
    });

    return filtered;
  }, [subjects, selectedYear, selectedSession, query]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-text">
            Select Past Paper to Annotate
          </h1>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        <div className="grid md:grid-cols-[320px,1fr] gap-4">
          {/* Left Sidebar - Search & Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-surface rounded-lg border border-border p-3">
              <AnnotateSearchBox
                value={query}
                onChange={(value) => {
                  updateSearch(value);
                  if (value) {
                    setSelectedSubject(null);
                  }
                }}
                onClear={() => {
                  clearSearch();
                  setSelectedSubject(null);
                }}
                suggestions={suggestions}
                parsedQuery={parsedQuery}
                formattedQuery={formattedQuery}
                isSearching={isSearching}
                placeholder="Try: 'phy u1 jan 24' or 'chem u1 oct'"
              />
            </div>

            {/* Quick Filters - Only show when not searching */}
            {!query && (
              <div className="bg-surface rounded-lg border border-border p-3 space-y-4">
                <AnnotateFilterDropdown
                  title="Year"
                  options={yearOptions}
                  selectedId={selectedYear}
                  onChange={setSelectedYear}
                  placeholder="All Years"
                />
                <AnnotateFilterDropdown
                  title="Session"
                  options={sessionOptions}
                  selectedId={selectedSession}
                  onChange={setSelectedSession}
                  placeholder="All Sessions"
                />
              </div>
            )}
          </div>

          {/* Right Content - Subject Grid */}
          <div className="bg-surface rounded-lg border border-border p-4">
            {query ? (
              // Search Results
              <div className="space-y-4">
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : results.length > 0 ? (
                  results.map((result) => (
                    <div 
                      key={`${result.subject.id}-${result.unit.id}`}
                      className="border-b border-border last:border-0 pb-4 last:pb-0"
                    >
                      <h2 className="text-lg font-medium text-text mb-3">
                        {result.subject.name} - {result.unit.name}
                      </h2>
                      <div className="space-y-2">
                        {result.papers.map((paper) => (
                          <div 
                            key={paper.id}
                            className="flex items-center gap-4 p-2 hover:bg-surface-alt
                              rounded-lg transition-colors"
                          >
                            <div className="flex-1">
                              <p className="text-text">
                                {paper.session} {paper.year}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/annotate/view/${paper.id}`}
                                className="px-4 py-1.5 text-sm font-medium rounded-full
                                  bg-primary text-white hover:opacity-90 
                                  transition-colors shadow-sm hover:shadow"
                              >
                                Annotate
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-muted">
                    No papers found matching your search
                  </div>
                )}
              </div>
            ) : (
              // Normal Subject List with Filters
              <AnnotateSubjectList
                subjects={filteredSubjects}
                selectedSubject={selectedSubject}
                onSubjectSelect={setSelectedSubject}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}