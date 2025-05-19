"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Script from "next/script";
import {
  papersApi,
  type Unit,
  type Paper,
  type UnitSummary,
} from "@/lib/api/papers";

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = params.subject as string;

  // Initialize state from URL params
  const [selectedUnit, setSelectedUnit] = useState<string | null>(
    searchParams.get('unit')
  );
  const [selectedSession, setSelectedSession] = useState<string | null>(
    searchParams.get('session')
  );
  const [selectedYears, setSelectedYears] = useState<Set<number>>(
    new Set(searchParams.get('years')?.split(',').map(Number).filter(Boolean) || [])
  );
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set(searchParams.get('expanded')?.split(',').filter(Boolean) || [])
  );

  // Add scroll position tracking
  useEffect(() => {
    // Restore scroll position on mount
    const savedPosition = searchParams.get('scroll');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
    }

    // Save scroll position before unload
    const handleBeforeUnload = () => {
      const currentPosition = window.scrollY;
      const params = new URLSearchParams(window.location.search);
      params.set('scroll', currentPosition.toString());
      router.replace(`/papers/${subjectId}?${params.toString()}`, {
        scroll: false
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [searchParams, router, subjectId]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedUnit) params.set('unit', selectedUnit);
    if (selectedYears.size > 0) params.set('years', Array.from(selectedYears).join(','));
    if (selectedSession) params.set('session', selectedSession);
    if (expandedUnits.size > 0) params.set('expanded', Array.from(expandedUnits).join(','));
    params.set('scroll', window.scrollY.toString());
    
    router.replace(`/papers/${subjectId}?${params.toString()}`, {
      scroll: false
    });
  }, [selectedUnit, selectedYears, selectedSession, expandedUnits, router, subjectId]);

  const [units, setUnits] = useState<Unit[]>([]);
  const [papersByUnit, setPapersByUnit] = useState<Record<string, Paper[]>>({});
  const [unitSummaries, setUnitSummaries] = useState<
    Record<string, UnitSummary>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load units and their summaries
  useEffect(() => {
    async function loadUnits() {
      try {
        const data = await papersApi.getSubjectUnits(subjectId);
        setUnits(data);

        // Load summaries for all units
        const summaries = await Promise.all(
          data.map((unit) => papersApi.getUnitSummary(subjectId, unit.id)),
        );

        // Create a map of unit ID to summary
        const summaryMap = summaries.reduce(
          (acc, summary) => {
            acc[summary.id] = summary;
            return acc;
          },
          {} as Record<string, UnitSummary>,
        );

        setUnitSummaries(summaryMap);
      } catch (err) {
        setError("Failed to load subject units. Please try again later.");
        console.error("Error loading units:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUnits();
  }, [subjectId]);

  // Load papers when a unit is selected
  useEffect(() => {
    if (!selectedUnit) return;

    async function loadPapers(unitId: string) {
      try {
        const papers = await papersApi.getUnitPapers(subjectId, unitId);
        setPapersByUnit((prev) => ({
          ...prev,
          [unitId]: papers,
        }));
      } catch (err) {
        console.error("Error loading papers:", err);
      }
    }

    // Only load if we haven't loaded this unit's papers before
    if (!papersByUnit[selectedUnit]) {
      loadPapers(selectedUnit);
    }
  }, [selectedUnit, subjectId, papersByUnit]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-alt rounded w-1/4"></div>
          <div className="h-4 bg-surface-alt rounded w-1/3"></div>
          <div className="space-y-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-surface-alt rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-text mb-2">Error</h2>
          <p className="text-text-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get all available years and sessions from summaries
  const { years, sessions } = Object.values(unitSummaries).reduce(
    (acc, summary) => {
      summary.years_with_sessions.forEach((year) => {
        acc.years.add(year.year);
        year.sessions.forEach((session) => acc.sessions.add(session));
      });
      return acc;
    },
    { years: new Set<number>(), sessions: new Set<string>() },
  );

  // Filter papers based on selected filters
  const getUnitPapers = (unitId: string) => {
    const papers = papersByUnit[unitId] || [];
    return papers
      .filter((paper) => {
        const matchesYear = selectedYears.size > 0
          ? selectedYears.has(paper.year)
          : true;
        const matchesSession = selectedSession
          ? paper.session === selectedSession
          : true;
        return matchesYear && matchesSession;
      })
      .sort((a, b) => {
        // Sort by year first (descending)
        if (a.year !== b.year) return b.year - a.year;
        // Then by month in chronological order (October, June, January)
        const sessionOrder: Record<string, number> = {
          October: 0,   // End of year
          June: 1,      // Mid-year
          May: 1,       // Same as June (May/June)
          January: 2,   // Start of year
        };
        return (sessionOrder[a.session] || 0) - (sessionOrder[b.session] || 0);
      });
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedYears(new Set());
    setSelectedSession(null);
  };

  // Get subject code from first unit's papers
  const firstUnitSummary = unitSummaries[units[0]?.id];
  const subjectCode = firstUnitSummary?.unit_codes[0]?.slice(0, -2);

  // Format subject name for structured data
  const formattedSubject = subjectId
    ? subjectId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  return (
    <>
      <Script
        id="subject-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Edexcel ${formattedSubject} Past Papers`,
            description: `Collection of Edexcel ${formattedSubject} past papers from 2015-2023, including mark schemes and examiner reports.`,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            educationalLevel: "High School, College",
            educationalUse: "Exercise, Assessment",
          }),
        }}
      />
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Subject Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold capitalize mb-2 text-text">
            {subjectId
              ? subjectId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()) + " Papers"
              : "Loading..."}
          </h1>
          <p className="text-text-muted">
            {units.length} units available • Select a unit to view papers
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
            {/* Year Filter - Enhanced UI */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-muted">
                  Year
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedYears(new Set())}
                    className={`text-xs px-2 py-0.5 rounded transition-colors
                      ${selectedYears.size === 0
                        ? "bg-primary text-white"
                        : "text-primary hover:text-primary-dark"
                      }`}
                  >
                    All Years
                  </button>
                </div>
              </div>
              
              {/* Years Grid */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-surface border border-border rounded-md">
                {Array.from(years)
                  .sort((a, b) => b - a)
                  .map((year) => {
                    const isSelected = selectedYears.has(year);
                    return (
                      <button
                        key={year}
                        onClick={() => {
                          const newSelectedYears = new Set(selectedYears);
                          if (isSelected) {
                            newSelectedYears.delete(year);
                          } else {
                            newSelectedYears.add(year);
                          }
                          setSelectedYears(newSelectedYears);
                        }}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all
                          ${isSelected
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface-alt text-text hover:bg-surface-alt/80"
                          } flex items-center justify-center min-w-[3rem]`}
                      >
                        {year}
                        {isSelected && (
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
              </div>
              
              {/* Quick Year Ranges - FIXED */}
              <div className="flex gap-1.5 mt-2">
                {[
                  { label: "Recent 3", years: 3 },
                  { label: "Last 5", years: 5 }, 
                  { label: "Clear All", years: 0 }
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      if (range.years === 0) {
                        setSelectedYears(new Set());
                      } else {
                        // Get sorted array of years (descending)
                        const sortedYears = Array.from(years).sort((a, b) => b - a);
                        
                        // Take the first N years where N is range.years
                        const recentYears = sortedYears.slice(0, range.years);
                        setSelectedYears(new Set(recentYears));
                      }
                    }}
                    className="text-xs px-2 py-1 bg-surface-alt rounded-md hover:bg-surface-alt/80 
                      transition-colors flex-1 text-center text-text-muted font-medium"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Filter */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Session
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(sessions).map((session) => (
                  <button
                    key={session}
                    onClick={() =>
                      setSelectedSession(
                        selectedSession === session ? null : session,
                      )
                    }
                    className={`px-3 py-1 rounded-full text-sm transition-colors
                      ${
                        selectedSession === session
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text hover:bg-surface-alt/80"
                      }`}
                  >
                    {session}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Units List */}
        <div className="space-y-6">
          {units.map((unit) => {
            const isSelected = selectedUnit === unit.id;
            const unitPapers = getUnitPapers(unit.id);
            const hasLoadedPapers = Boolean(papersByUnit[unit.id]);
            const summary = unitSummaries[unit.id];

            return (
              <div
                key={unit.id}
                className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden"
              >
                {/* Unit Header */}
                <button
                  onClick={() => {
                    const newUnit = isSelected ? null : unit.id;
                    setSelectedUnit(newUnit);
                    setExpandedUnits(prev => {
                      const newSet = new Set(prev);
                      if (newUnit) {
                        newSet.add(newUnit);
                      } else {
                        newSet.delete(unit.id);
                      }
                      return newSet;
                    });
                  }}
                  className="w-full p-4 text-left bg-surface hover:bg-surface-alt
                    transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-text">
                        {unit.name}
                      </h2>
                    </div>
                    <span className="text-sm text-text-muted ml-4">
                      {summary?.total_papers ?? "..."} papers
                    </span>
                  </div>
                  {unit.description && (
                    <p className="text-sm text-text-muted mt-1">
                      {unit.description}
                    </p>
                  )}
                </button>

                {/* Papers List */}
                {(isSelected || expandedUnits.has(unit.id)) && (
                  <div className="divide-y divide-border">
                    {!hasLoadedPapers ? (
                      <div className="p-4">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-surface-alt rounded w-3/4"></div>
                            <div className="h-4 bg-surface-alt rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ) : unitPapers.length > 0 ? (
                      <>
                        {/* Group papers by year and render with year headers */}
                        {(() => {
                          // Group papers by year
                          const papersByYear = unitPapers.reduce((acc, paper) => {
                            if (!acc[paper.year]) {
                              acc[paper.year] = [];
                            }
                            acc[paper.year].push(paper);
                            return acc;
                          }, {} as Record<number, Paper[]>);
                          
                          // Sort years in descending order
                          const sortedYears = Object.keys(papersByYear)
                            .map(Number)
                            .sort((a, b) => b - a);
                          
                          return sortedYears.map((year) => (
                            <div key={year}>
                              <div className="sticky top-0 bg-surface-alt/50 backdrop-blur-sm px-4 py-2 border-y border-border">
                                <span className="text-sm font-semibold text-primary">
                                  {year}
                                </span>
                              </div>
                              {papersByYear[year].map((paper) => (
                                <div
                                  key={paper.id}
                                  className="p-4 hover:bg-surface-alt transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-medium text-text flex items-center gap-2">
                                        {paper.session} {paper.year}
                                        <span className="text-sm px-2 py-0.5 bg-surface-alt rounded font-mono">
                                          {paper.unit_code}
                                        </span>
                                      </h3>
                                    </div>
                                  </div>

                                  {/* Paper and Marking Scheme */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Question Paper Button */}
                                    {paper.pdf_url !== "/nopaper" ? (
                                      <button
                                        onClick={() => {
                                          const encodedPDF = btoa(paper.pdf_url);
                                          const encodedMS = btoa(paper.marking_scheme_url);
                                          router.push(`/papers/view?type=qp&pdfUrl=${encodedPDF}&msUrl=${encodedMS}`);
                                        }}
                                        className="flex items-center justify-center gap-2 p-3
                                          bg-primary text-white rounded-lg hover:opacity-90
                                          transition-colors shadow-sm hover:shadow w-full cursor-pointer"
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
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="flex items-center justify-center gap-2 p-3
                                          bg-surface-alt text-text-muted rounded-lg cursor-not-allowed
                                          transition-colors border border-border"
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
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        Paper Unavailable
                                      </button>
                                    )}

                                    {/* Marking Scheme Button */}
                                    {paper.marking_scheme_url !== "/nopaper" ? (
                                      <button
                                        onClick={() => {
                                          const encodedPDF = btoa(paper.pdf_url);
                                          const encodedMS = btoa(paper.marking_scheme_url);
                                          router.push(`/papers/view?type=ms&pdfUrl=${encodedPDF}&msUrl=${encodedMS}`);
                                        }}
                                        className="flex items-center justify-center gap-2 p-3
                                          bg-secondary text-white rounded-lg hover:opacity-90
                                          transition-colors shadow-sm hover:shadow w-full cursor-pointer"
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
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="flex items-center justify-center gap-2 p-3
                                          bg-surface-alt text-text-muted rounded-lg cursor-not-allowed
                                          transition-colors border border-border"
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
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        MS Unavailable
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                      </>
                    ) : (
                      <div className="p-4 text-center text-text-muted">
                        No papers available for this unit with selected filters
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
