"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { consumeLatestPapersState } from "@/utils/latestPapersState";
import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import {
  papersApi,
  type Unit,
  type Paper,
  type UnitSummary,
} from "@/lib/api/papers";

// Cache for storing loaded data across page visits
const globalCache = {
  units: {} as Record<string, Unit[]>,
  unitSummaries: {} as Record<string, Record<string, UnitSummary>>,
  papersByUnit: {} as Record<string, Record<string, Paper[]>>,
};

// State management for sessionStorage
const getStorageKey = (subjectId: string) => `papers_state_${subjectId}`;
const getScrollKey = (subjectId: string) => `papers_scroll_${subjectId}`;

const saveStateToSession = (subjectId: string, state: {
  selectedUnit: string | null;
  selectedSession: string | null;
  selectedYears: number[];
  expandedUnits: string[];
}) => {
  try {
    sessionStorage.setItem(getStorageKey(subjectId), JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state to sessionStorage:', error);
  }
};

const loadStateFromSession = (subjectId: string) => {
  try {
    const stored = sessionStorage.getItem(getStorageKey(subjectId));
    if (stored) {
      const state = JSON.parse(stored);
      return {
        selectedUnit: state.selectedUnit || null,
        selectedSession: state.selectedSession || null,
        selectedYears: new Set(state.selectedYears || []),
        expandedUnits: new Set(state.expandedUnits || []),
      };
    }
  } catch (error) {
    console.warn('Failed to load state from sessionStorage:', error);
  }
  return null;
};

const clearStateFromSession = (subjectId: string) => {
  try {
    sessionStorage.removeItem(getStorageKey(subjectId));
    sessionStorage.removeItem(getScrollKey(subjectId));
  } catch (error) {
    console.warn('Failed to clear state from sessionStorage:', error);
  }
};

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = params.subject as string;
  
  // Track if component is mounted and other refs
  const isMounted = useRef(false);
  const shouldSelectLatestYear = useRef(consumeLatestPapersState());
  const initialStateLoaded = useRef(false);
  
  // Check if we're returning from paper view
  const isReturningFromPaperView = useRef(false);
  
  // Initialize state - either from sessionStorage or URL params (for direct links)
  const initializeState = () => {
    // First check sessionStorage
    const sessionState = loadStateFromSession(subjectId);
    if (sessionState) {
      return sessionState;
    }
    
    // Fallback to URL params for direct links
    return {
      selectedUnit: searchParams.get('unit'),
      selectedSession: searchParams.get('session'),
      selectedYears: new Set(searchParams.get('years')?.split(',').map(Number).filter(Boolean) || []),
      expandedUnits: new Set(searchParams.get('expanded')?.split(',').filter(Boolean) || []),
    };
  };

  const initialState = initializeState();
  
  const [selectedUnit, setSelectedUnit] = useState<string | null>(initialState.selectedUnit);
  const [selectedSession, setSelectedSession] = useState<string | null>(initialState.selectedSession);
  const [selectedYears, setSelectedYears] = useState<Set<number>>(initialState.selectedYears);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(initialState.expandedUnits);

  // Application state
  const [units, setUnits] = useState<Unit[]>(globalCache.units[subjectId] || []);
  const [papersByUnit, setPapersByUnit] = useState<Record<string, Paper[]>>(
    globalCache.papersByUnit[subjectId] || {}
  );
  const [unitSummaries, setUnitSummaries] = useState<Record<string, UnitSummary>>(
    globalCache.unitSummaries[subjectId] || {}
  );
  const [loading, setLoading] = useState(!globalCache.units[subjectId]);
  const [error, setError] = useState<string | null>(null);

  // Clean URL - remove query parameters since we're using sessionStorage
  const cleanUrl = useCallback(() => {
    router.replace(`/papers/${subjectId}`, { scroll: false });
  }, [router, subjectId]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (!isMounted.current || !initialStateLoaded.current) return;
    
    const state = {
      selectedUnit,
      selectedSession,
      selectedYears: Array.from(selectedYears),
      expandedUnits: Array.from(expandedUnits),
    };
    
    saveStateToSession(subjectId, state);
  }, [selectedUnit, selectedSession, selectedYears, expandedUnits, subjectId]);

  // Save scroll position when navigating to view page
  const handleViewPaper = useCallback((encodedPDF: string, encodedMS: string, type: string, paperData: {
    subject: string;
    unit: string;
    session: string;
    year: number;
    unitCode: string;
  }) => {
    // Save scroll position to sessionStorage
    const scrollPosition = window.scrollY;
    try {
      sessionStorage.setItem(getScrollKey(subjectId), scrollPosition.toString());
    } catch (error) {
      console.warn('Failed to save scroll position:', error);
    }
    
    // Create a data object with all the info
    const viewData = {
      type,
      pdfUrl: encodedPDF,
      msUrl: encodedMS,
      ...paperData
    };
    
    // Encode the entire data object and put it in the hash
    const hashData = btoa(JSON.stringify(viewData));
    
    // Navigate to clean URL with data in hash
    router.push(`/papers/view#${hashData}`);
  }, [router, subjectId]);

  // Check if we're returning from paper view page and restore scroll + state
  useEffect(() => {
    isMounted.current = true;
    
    // Check if we're returning from paper view
    const referrer = document.referrer;
    const currentPath = window.location.pathname;
    isReturningFromPaperView.current = referrer.includes('/papers/view') && currentPath.includes(`/papers/${subjectId}`);
    
    if (isReturningFromPaperView.current) {
      // Restore scroll position
      const savedPosition = sessionStorage.getItem(getScrollKey(subjectId));
      if (savedPosition) {
        // Use a small timeout to ensure content has rendered
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'auto'
          });
        }, 100);
      }
    } else {
      // If not returning from paper view, clean URL on first load
      if (searchParams.toString()) {
        cleanUrl();
      }
    }
    
    initialStateLoaded.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, [subjectId, searchParams, cleanUrl]);

  // Cleanup sessionStorage when leaving the page or changing subjects
  useEffect(() => {
    return () => {
      // Only clear if we're navigating away from this subject entirely
      // Check if we're still on a papers-related page for this subject
      const currentPath = window.location.pathname;
      const isOnPapersView = currentPath.includes('/papers/view');
      const isOnSameSubject = currentPath.includes(`/papers/${subjectId}`);
      
      // Don't clear if we're going to the view page or staying on the same subject
      if (!isOnPapersView && !isOnSameSubject) {
        clearStateFromSession(subjectId);
      }
    };
  }, [subjectId]);

  // Load units and their summaries from API or cache
  useEffect(() => {
    async function loadUnits() {
      if (globalCache.units[subjectId]) {
        // Use cached data if available
        setUnits(globalCache.units[subjectId]);
        setUnitSummaries(globalCache.unitSummaries[subjectId]);
        setPapersByUnit(globalCache.papersByUnit[subjectId] || {});
        setLoading(false);
        return;
      }

      try {
        const data = await papersApi.getSubjectUnits(subjectId);
        setUnits(data);
        // Cache units for this subject
        globalCache.units[subjectId] = data;

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
        // Cache summaries
        globalCache.unitSummaries[subjectId] = summaryMap;

        // Set the most recent year if needed (only if no saved state and no URL params)
        if (shouldSelectLatestYear.current && !selectedYears.size && !searchParams.get('years')) {
          const allYears = Array.from(
            Object.values(summaryMap).reduce((acc, summary) => {
              summary.years_with_sessions.forEach((year) => acc.add(year.year));
              return acc;
            }, new Set<number>())
          );
          
          if (allYears.length > 0) {
            const mostRecentYear = Math.max(...allYears);
            setSelectedYears(new Set([mostRecentYear]));
            shouldSelectLatestYear.current = false;
          }
        }
        
        // Initialize papers cache for this subject if needed
        if (!globalCache.papersByUnit[subjectId]) {
          globalCache.papersByUnit[subjectId] = {};
        }
        
        // If we have a selected unit or expanded units, load those papers immediately
        if (selectedUnit || expandedUnits.size > 0) {
          const unitsToLoad = new Set<string>();
          if (selectedUnit) unitsToLoad.add(selectedUnit);
          expandedUnits.forEach(unit => unitsToLoad.add(unit));
          
          for (const unitId of unitsToLoad) {
            const unitPapers = await papersApi.getUnitPapers(subjectId, unitId);
            setPapersByUnit(prev => ({
              ...prev,
              [unitId]: unitPapers
            }));
            globalCache.papersByUnit[subjectId][unitId] = unitPapers;
          }
        }
      } catch (err) {
        setError("Failed to load subject units. Please try again later.");
        console.error("Error loading units:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadUnits();
  }, [subjectId, selectedUnit, expandedUnits, selectedYears, searchParams]);

  // Load papers when a unit is selected or expanded
  useEffect(() => {
    async function loadPapers(unitId: string) {
      try {
        // Check if cached first
        if (globalCache.papersByUnit[subjectId]?.[unitId]) {
          setPapersByUnit(prev => ({
            ...prev,
            [unitId]: globalCache.papersByUnit[subjectId][unitId],
          }));
          return;
        }

        const papers = await papersApi.getUnitPapers(subjectId, unitId);
        setPapersByUnit(prev => ({
          ...prev,
          [unitId]: papers,
        }));
        
        // Cache papers
        if (!globalCache.papersByUnit[subjectId]) {
          globalCache.papersByUnit[subjectId] = {};
        }
        globalCache.papersByUnit[subjectId][unitId] = papers;
      } catch (err) {
        console.error("Error loading papers:", err);
      }
    }

    // Load papers for selected unit if not already loaded
    if (selectedUnit && !papersByUnit[selectedUnit]) {
      loadPapers(selectedUnit);
    }
    
    // Also load papers for any expanded units
    expandedUnits.forEach(unitId => {
      if (!papersByUnit[unitId]) {
        loadPapers(unitId);
      }
    });
  }, [selectedUnit, expandedUnits, subjectId, papersByUnit]);

  // Loading state UI
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

  // Error state UI
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
      {/* ...existing JSX code remains the same... */}
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
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
            </div>
            
            {/* Data Booklet Button - Positioned alongside header */}
            {(subjectId === 'chemistry' || subjectId === 'mathematics') && (
              <div className="flex-shrink-0">
                <a
                  href={
                    subjectId === 'chemistry'
                      ? 'https://qualifications.pearson.com/content/dam/pdf/A%20Level/Chemistry/2015/teaching-and-learning-materials/a-level-chemistry-data-booklet-9ch0.pdf'
                      : 'https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/IAL-Mathematics-Formula-Book.pdf'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-surface border border-border 
                    rounded-lg hover:bg-surface-alt transition-colors text-sm font-medium text-text
                    shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-primary 
                    focus:ring-offset-2 focus:ring-offset-background whitespace-nowrap"
                >
                  <svg
                    className="w-4 h-4 text-text-muted flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    {subjectId === 'chemistry' ? 'Data Booklet' : 'Formula Book'}
                  </span>
                  <span className="sm:hidden">
                    {subjectId === 'chemistry' ? 'Data' : 'Formulas'}
                  </span>
                  <svg
                    className="w-3 h-3 text-text-muted flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
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
              
              {/* Quick Year Ranges */}
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
            const isExpanded = isSelected || expandedUnits.has(unit.id);
            const unitPapers = getUnitPapers(unit.id);
            const hasLoadedPapers = Boolean(papersByUnit[unit.id]);
            const summary = unitSummaries[unit.id];
            const isLoading = isExpanded && !hasLoadedPapers;

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
                    
                    // Toggle expanded state
                    setExpandedUnits(prev => {
                      const newSet = new Set(prev);
                      if (isExpanded) {
                        newSet.delete(unit.id);
                      } else {
                        newSet.add(unit.id);
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
                {isExpanded && (
                  <div className="divide-y divide-border">
                    {isLoading ? (
                      <div className="p-4">
                        <div className="animate-pulse space-y-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-surface-alt rounded w-3/4"></div>
                            <div className="h-4 bg-surface-alt rounded w-1/2"></div>
                            <div className="h-20 bg-surface-alt rounded"></div>
                            <div className="h-20 bg-surface-alt rounded"></div>
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
                                          handleViewPaper(encodedPDF, encodedMS, 'qp', {
                                            subject: subjectId,
                                            unit: unit.id,
                                            session: paper.session,
                                            year: paper.year,
                                            unitCode: paper.unit_code
                                          });
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
                                          handleViewPaper(encodedPDF, encodedMS, 'ms', {
                                            subject: subjectId,
                                            unit: unit.id,
                                            session: paper.session,
                                            year: paper.year,
                                            unitCode: paper.unit_code
                                          });
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