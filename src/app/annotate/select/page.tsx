'use client';

import { useState, useMemo, useEffect } from 'react';
import AnnotateSearchBox from '@/components/annotate-select/AnnotateSearchBox';
import AnnotateFilterDropdown from '@/components/annotate-select/AnnotateFilterDropdown';
import AnnotateSubjectList from '@/components/annotate-select/AnnotateSubjectList';
import { useAnnotateSearchAPI } from '@/hooks/useAnnotateSearchAPI';
import { papersApi, type Paper as APIPaper } from '@/lib/api/papers';
import type { Subject, Paper } from '@/types/subject';

export default function AnnotateSelectPage() {
  // Use the new API-based hook
  const {
    query,
    parsedQuery,
    formattedQuery,
    results,
    suggestions,
    subjects,
    isSearching,
    loading,
    error,
    yearOptions,
    sessionOptions,
    updateSearch,
    clearSearch
  } = useAnnotateSearchAPI();

  // Subject selection state
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [subjectPapers, setSubjectPapers] = useState<Record<string, Record<string, APIPaper[]>>>({});

  // Fetch papers for each subject/unit
  useEffect(() => {
    if (!subjects) return;

    const loadPapers = async () => {
      const papers: Record<string, Record<string, APIPaper[]>> = {};

      for (const subject of subjects) {
        papers[subject.id] = {};
        
        for (const unit of subject.units) {
          try {
            const unitPapers = await papersApi.getUnitPapers(subject.id, unit.id);
            papers[subject.id][unit.id] = unitPapers;
          } catch (err) {
            console.error(`Error loading papers for ${subject.id}/${unit.id}:`, err);
            papers[subject.id][unit.id] = [];
          }
        }
      }

      setSubjectPapers(papers);
    };

    loadPapers();
  }, [subjects]);

  // Convert subjects array to record format for AnnotateSubjectList
  const subjectsRecord = useMemo(() => {
    if (!subjects || !subjectPapers) return {};
    
    return subjects.reduce((acc, subject) => {
      acc[subject.id] = {
        id: subject.id,
        name: subject.name,
        units: subject.units,
        papers: subject.units.flatMap(unit => 
          // Get papers from our fetched data and convert to expected format
          (subjectPapers[subject.id]?.[unit.id] || []).map(p => ({
            id: p.id,
            unitId: p.unit_id,
            unit_id: p.unit_id,
            unit_code: p.unit_code,
            year: p.year,
            session: p.session,
            pdfUrl: p.pdf_url,
            pdf_url: p.pdf_url,
            markingSchemeUrl: p.marking_scheme_url,
            marking_scheme_url: p.marking_scheme_url,
            title: p.title
          } as Paper))
        )
      };
      return acc;
    }, {} as Record<string, Subject>);
  }, [subjects, subjectPapers]);

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="bg-surface border-b border-border">
          <div className="max-w-screen-2xl mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-text">
              Select Past Paper to Annotate
            </h1>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="bg-surface border-b border-border">
          <div className="max-w-screen-2xl mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-text">
              Select Past Paper to Annotate
            </h1>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="text-center py-8 text-text-muted">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 block mx-auto"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

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
                                {paper.unit_code && (
                                  <span className="ml-2 text-sm text-text-muted">
                                    {paper.unit_code}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/annotate/view/paper?pdf=${encodeURIComponent(paper.pdf_url)}&title=${encodeURIComponent(`${paper.session} ${paper.year}${paper.unit_code ? ` ${paper.unit_code}` : ''}`)}`}
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
                subjects={subjectsRecord}
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