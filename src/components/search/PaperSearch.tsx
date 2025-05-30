"use client";

import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import SearchBox from "./SearchBox";
import FilterBox from "./FilterBox";
import subjectsData from "@/lib/data/subjects.json";
import { motion, AnimatePresence } from "framer-motion";
import type { Subject, Paper } from "@/types/subject";
import type { SearchQuery, SearchResult } from "@/types/search";

interface SubjectsData {
  subjects: {
    [key: string]: Subject;
  };
}

// Type assertion helper to fix Subject/Paper compatibility
const castSubjectsData = (data: any): SubjectsData => data as SubjectsData;

interface PaperSearchProps {
  initialQuery?: string;
}

// Enum for active filter sections
enum FilterSection {
  NONE = "none",
  SUBJECTS = "subjects",
  UNITS = "units",
  SESSIONS = "sessions"
}

// Adaptive animation settings based on user preferences
const getAnimationSettings = () => {
  // Check for reduced motion preference
  if (typeof window !== 'undefined' && 
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return {
      duration: 0.1,
      initial: false,
    };
  }
  return {
    duration: 0.3,
    initial: { height: 0, opacity: 0 }
  };
};

// Helper to combine similar sessions (May/June)
const formatSessionName = (session: string, year: number): string => {
  if (!session) return `Unknown ${year || ''}`;
  
  if (session.toLowerCase() === 'may') return `May/June ${year}`;
  if (session.toLowerCase() === 'june') return `May/June ${year}`;
  if (session.toLowerCase() === 'feb') return `February ${year}`;
  if (session.toLowerCase() === 'jan') return `January ${year}`;
  if (session.toLowerCase() === 'oct') return `October ${year}`;
  if (session.toLowerCase() === 'nov') return `November ${year}`;
  return `${session} ${year}`;
};

// Helper to get the raw session name
const getRawSession = (formattedSession: string): {session: string, year: string} => {
  const match = formattedSession.match(/^([A-Za-z\/]+)\s+(\d{4})$/);
  if (!match) return { session: "", year: "" };
  
  let [, session, year] = match;
  
  // Handle the May/June case
  if (session === 'May/June') {
    session = 'May'; // Default to May for searching
  }
  
  return { session, year };
};

const FILTERS_VISIBLE_KEY = "papernexus:filters-visible";

// Helper function to create view URL with hash data (matching subject page format)
const createViewUrl = (paper: Paper, type: 'qp' | 'ms', subject: { id: string; name: string }, unit: { id: string; name: string }) => {
  const viewData = {
    type,
    pdfUrl: btoa(paper.pdf_url),
    msUrl: btoa(paper.marking_scheme_url),
    subject: subject.id,
    unit: unit.id,
    session: paper.session,
    year: paper.year,
    unitCode: paper.unit_code || 'unknown'
  };
  
  // Encode the entire data object and put it in the hash
  const hashData = btoa(JSON.stringify(viewData));
  
  return `/papers/view#${hashData}`;
};

export default function PaperSearch({ initialQuery = "" }: PaperSearchProps) {
  const {
    query,
    results,
    suggestions,
    isSearching,
    updateQuery,
    clearSearch,
    recentSearches,
    hasMore,
    loadMore
  } = useSearch({ debounceMs: 300, pageSize: 20 });

  // Infinite scroll handling
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isSearching) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isSearching, loadMore]);

  // Search focus handling
  const searchRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const animSettings = useMemo(() => getAnimationSettings(), []);
  const focusAttemptsRef = useRef(0);

  // Enhanced focus handling with multiple strategies
  useEffect(() => {
    // Check if we should focus (coming from home search or nav search)
    const shouldFocus = searchParams.get("focus") === "true";
    
    if (shouldFocus && searchRef.current) {
      // On mobile, use a different focus strategy
      const isMobile = window.innerWidth < 768;
      
      // Attempt multi-stage focus approach
      const attemptFocus = () => {
        try {
          // Try to focus the input element
          searchRef.current?.focus();
          focusAttemptsRef.current += 1;
          
          // If focus doesn't seem to work (sometimes happens on iOS), try again
          if (document.activeElement !== searchRef.current && focusAttemptsRef.current < 3) {
            setTimeout(attemptFocus, 150);
          }
        } catch (err) {
          console.error("Focus error:", err);
        }
      };
      
      // Initial delay depends on device
      const initialDelay = isMobile ? 400 : 100;
      
      // First attempt with delay
      const timer = setTimeout(() => {
        attemptFocus();
        
        // Additional RAF for more reliable timing
        requestAnimationFrame(() => {
          attemptFocus();
        });
      }, initialDelay);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Additional focus effect that runs after the page has fully rendered
  useEffect(() => {
    if (searchParams.get("focus") === "true" && searchRef.current) {
      // This effect runs once after initial render
      const timer = setTimeout(() => {
        searchRef.current?.focus();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(FILTERS_VISIBLE_KEY) === "true";
    }
    return false;
  });
  
  // Track which filter section is expanded
  const [expandedSection, setExpandedSection] = useState<FilterSection>(FilterSection.NONE);

  // For delayed loading (improves initial paint speed)
  const [loadedFilters, setLoadedFilters] = useState(false);
  useEffect(() => {
    // Small delay to improve initial load performance
    const timer = setTimeout(() => {
      setLoadedFilters(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save filter visibility preference
  useEffect(() => {
    localStorage.setItem(FILTERS_VISIBLE_KEY, showFilters.toString());
  }, [showFilters]);

  // Set initial query if provided
  useEffect(() => {
    if (initialQuery) {
      updateQuery({ text: initialQuery });
    }
  }, [initialQuery, updateQuery]);

  // Check if any filters are active
  const hasActiveFilters =
    selectedSubject || selectedUnits.length > 0 || selectedSession;

  // Reset all filters function
  const resetAllFilters = useCallback(() => {
    setSelectedSubject(null);
    setSelectedUnits([]);
    setSelectedSession(null);
    updateQuery({
      subject: undefined,
      unit: undefined,
      session: undefined,
      year: undefined
    });
  }, [updateQuery]);

  // Clear specific filter sections
  const clearSubjectFilters = useCallback(() => {
    setSelectedSubject(null);
    setSelectedUnits([]);
    updateQuery({ subject: undefined, unit: undefined });
  }, [updateQuery]);

  const clearUnitFilters = useCallback(() => {
    setSelectedUnits([]);
    updateQuery({ unit: undefined });
  }, [updateQuery]);

  const clearSessionFilters = useCallback(() => {
    setSelectedSession(null);
    updateQuery({
      session: undefined,
      year: undefined,
    });
  }, [updateQuery]);

  // Transform subjects data into filter items
  const subjectFilters = useMemo(() => {
    return Object.values(castSubjectsData(subjectsData).subjects).map(
      (subject) => ({
        id: subject.id,
        name: subject.name,
        count: subject.papers.length,
        isSelected: selectedSubject === subject.id,
      })
    );
  }, [selectedSubject]);

  // Get units for selected subject
  const unitFilters = useMemo(() => {
    if (!selectedSubject) return [];
    const subject = castSubjectsData(subjectsData).subjects[selectedSubject];
    if (!subject) return [];

    return subject.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      count: subject.papers.filter((p) => p.unit_id === unit.id).length,
      isSelected: selectedUnits.includes(unit.id),
    }));
  }, [selectedSubject, selectedUnits]);

  // Get all available sessions/years based on current selection
  const sessionFilters = useMemo(() => {
    let papersToFilter: Paper[] = [];
    
    if (selectedSubject) {
      const subject = castSubjectsData(subjectsData).subjects[selectedSubject];
      if (subject) {
        // If units are selected, filter by those units
        if (selectedUnits.length > 0) {
          papersToFilter = subject.papers.filter(p => 
            selectedUnits.includes(p.unit_id)
          );
        } else {
          // Otherwise use all papers from the subject
          papersToFilter = subject.papers;
        }
      }
    } else {
      // If no subject selected, use all papers
      papersToFilter = Object.values(
        castSubjectsData(subjectsData).subjects
      ).flatMap(s => s.papers);
    }
    
    // Deduplicate papers based on pdfUrl before creating session map
    const seenPdfUrls = new Set<string>();
    const uniquePapers = papersToFilter.filter(paper => {
      if (seenPdfUrls.has(paper.pdf_url)) {
        return false;
      }
      seenPdfUrls.add(paper.pdf_url);
      return true;
    });
    
    // Create a map to combine similar sessions (May/June)
    const sessionMap = new Map<string, number>();
    
    uniquePapers.forEach(paper => {
      const formattedSession = formatSessionName(paper.session, paper.year);
      sessionMap.set(formattedSession, (sessionMap.get(formattedSession) || 0) + 1);
    });
    
    // Convert to array and sort by year (newest first)
    const sessions = Array.from(sessionMap.entries())
      .map(([session, count]) => ({ session, count }))
      .sort((a, b) => {
        const yearA = parseInt(a.session.split(' ').pop() || '0', 10);
        const yearB = parseInt(b.session.split(' ').pop() || '0', 10);
        if (yearA !== yearB) return yearB - yearA;
        
        // If years are the same, sort by session month
        return a.session.localeCompare(b.session);
      });
      
    return sessions.map(({ session, count }) => ({
      id: session,
      name: session,
      count,
      isSelected: selectedSession === session,
    }));
  }, [selectedSubject, selectedUnits, selectedSession]);

  // Handle filter selections
  const handleSubjectSelect = useCallback(
    (id: string) => {
      setSelectedSubject(id);
      setSelectedUnits([]);
      
      // Make sure we have a valid subject
      const subject = castSubjectsData(subjectsData).subjects[id];
      if (subject) {
        updateQuery({
          subject: subject.name,
          unit: undefined
        });
      }
    },
    [updateQuery]
  );

  const handleSubjectDeselect = useCallback(() => {
    setSelectedSubject(null);
    setSelectedUnits([]);
    updateQuery({ subject: undefined, unit: undefined });
  }, [updateQuery]);

  const handleUnitSelect = useCallback(
    (id: string) => {
      setSelectedUnits((prev) => [...prev, id]);
      if (selectedSubject) {
        const subject = castSubjectsData(subjectsData).subjects[
          selectedSubject
        ];
        const unit = subject?.units.find((u) => u.id === id);
        if (unit) {
          updateQuery({ unit: unit.name });
        }
      }
    },
    [selectedSubject, updateQuery]
  );

  const handleUnitDeselect = useCallback(
    (id: string) => {
      setSelectedUnits((prev) => prev.filter((unitId) => unitId !== id));
      // Only remove unit from query if we're deselecting the last unit
      if (selectedUnits.length <= 1) {
        updateQuery({ unit: undefined });
      }
    },
    [updateQuery, selectedUnits]
  );

  const handleSessionSelect = useCallback(
    (id: string) => {
      setSelectedSession(id);
      const { session, year } = getRawSession(id);
      updateQuery({
        session: session,
        year: parseInt(year, 10),
      });
    },
    [updateQuery]
  );

  const handleSessionDeselect = useCallback(() => {
    setSelectedSession(null);
    updateQuery({
      session: undefined,
      year: undefined,
    });
  }, [updateQuery]);

  // Toggle handlers for filter sections
  const toggleSubjectsSection = useCallback(() => {
    setExpandedSection(prev => 
      prev === FilterSection.SUBJECTS ? FilterSection.NONE : FilterSection.SUBJECTS
    );
  }, []);
  
  const toggleUnitsSection = useCallback(() => {
    setExpandedSection(prev => 
      prev === FilterSection.UNITS ? FilterSection.NONE : FilterSection.UNITS
    );
  }, []);
  
  const toggleSessionsSection = useCallback(() => {
    setExpandedSection(prev => 
      prev === FilterSection.SESSIONS ? FilterSection.NONE : FilterSection.SESSIONS
    );
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mobile-container-fix">
      {/* Filter Toggle - improved for touch */}
      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className={`w-full mb-3 px-3 sm:px-4 py-3 text-sm
          flex items-center justify-between transition-colors
          rounded-lg border border-border hover:border-border-light
          bg-surface hover:bg-surface-alt
          focus:outline-none focus:ring-2 focus:ring-primary/30
          text-text active:opacity-90`}
        style={{ touchAction: 'manipulation' }}
        aria-expanded={showFilters}
        aria-controls="search-filters"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              showFilters ? "rotate-180" : ""
            }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? "Hide filters" : "Show filters"}
        </span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
            Filters active
          </span>
        )}
      </button>

      {/* Reset all filters button - only visible when filters are active */}
      {hasActiveFilters && (
        <div className="w-full flex justify-end -mt-1 mb-3 px-1">
          <button
            onClick={resetAllFilters}
            className="text-xs text-text-muted hover:text-primary transition-colors
              flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-surface-alt"
            aria-label="Reset all filters"
          >
            <svg 
              className="w-3 h-3" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reset filters
          </button>
        </div>
      )}

      {/* Filter Section with optimized animations */}
      <AnimatePresence initial={false}>
        {showFilters && loadedFilters && (
          <motion.div
            id="search-filters"
            initial={animSettings.initial}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: animSettings.duration,
              ease: [0.25, 0.1, 0.25, 1.0]  // Optimized ease curve
            }}
            className="mb-4 overflow-hidden will-change-transform"
          >
            <div className="space-y-3 pb-2">
              <FilterBox
                title="Subjects"
                items={subjectFilters}
                onSelect={handleSubjectSelect}
                onDeselect={handleSubjectDeselect}
                expanded={expandedSection === FilterSection.SUBJECTS}
                onToggleExpand={toggleSubjectsSection}
                onClearAll={selectedSubject ? clearSubjectFilters : undefined}
              />

              {selectedSubject && (
                <FilterBox
                  title="Units"
                  items={unitFilters}
                  onSelect={handleUnitSelect}
                  onDeselect={handleUnitDeselect}
                  multiSelect={true}
                  expanded={expandedSection === FilterSection.UNITS}
                  onToggleExpand={toggleUnitsSection}
                  onClearAll={selectedUnits.length > 0 ? clearUnitFilters : undefined}
                />
              )}

              <FilterBox
                title="Available Sessions"
                items={sessionFilters}
                onSelect={handleSessionSelect}
                onDeselect={handleSessionDeselect}
                expanded={expandedSection === FilterSection.SESSIONS}
                onToggleExpand={toggleSessionsSection}
                onClearAll={selectedSession ? clearSessionFilters : undefined}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Box */}
      <SearchBox
        ref={searchRef}
        value={query.text}
        onChange={(text: string) => updateQuery({ text })}
        onClear={clearSearch}
        placeholder="Try: 'phy u1 jan 24' or 'chem u1 oct'"
        className="mb-4"
      />

      {/* Results Section - with fixed mobile layout */}
      <div className="mx-0 sm:-mx-4">
        {isSearching ? (
          <div className="flex justify-center py-8 items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y divide-border" role="list">
            {/* Results */}
            {results.map((result: SearchResult, index) => {
              return (
                <div
                  key={`${result.paper.id}-${index}`}
                  className={`
                    relative px-3 sm:px-4 py-4 flex flex-col sm:flex-row sm:items-center
                    hover:bg-surface-alt/50 transition-colors
                    active:bg-surface-alt/70 sm:active:bg-surface-alt/50
                    border-t first:border-t-0 border-border
                  `}
                  role="listitem"
                  // Animation for search results (staggered entry)
                  style={{
                    opacity: 0,
                    animation: `searchFadeIn 0.3s ease-out ${index * 0.05}s forwards`
                  }}
                >
                  {/* Add a subtle ripple effect on mobile touches */}
                  <div className="absolute inset-0 pointer-events-none sm:hidden" 
                       style={{ overflow: 'hidden' }}>
                    <span className="ripple-effect" />
                  </div>
                  
                  <div className="min-w-0 flex-1 mb-3 sm:mb-0">
                    <h3 className="font-medium text-text break-words">
                      {result.subject.name} - {result.unit.name}
                    </h3>
                    <div>
                      <p className="text-sm text-text-muted">
                        {result.paper.session || "Unknown"} {result.paper.year || ""}
                        {result.paper.unit_code && (
                          <span className="text-xs ml-2 font-mono bg-surface-alt/70 px-1.5 py-0.5 rounded">
                            {result.paper.unit_code}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile-friendly action buttons with visual feedback */}
                  <div className="flex gap-2 sm:gap-2.5 sm:ml-6 mx-0 sm:-mx-1 sm:mx-0">
                    {/* Question Paper Button */}
                    {result.paper.pdf_url !== "/nopaper" ? (
                      <Link
                        href={createViewUrl(result.paper, 'qp', result.subject, result.unit)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View paper for ${result.subject.name} ${result.unit.name}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium 
                          bg-primary text-white rounded-full hover:opacity-90
                          transition-all shadow-sm hover:shadow active:scale-[0.98]
                          touch-manipulation"
                        style={{ 
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="whitespace-nowrap">Paper</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium 
                          bg-surface-alt text-text-muted rounded-full cursor-not-allowed
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
                        <span className="whitespace-nowrap">No Paper</span>
                      </button>
                    )}
                    
                    {/* Marking Scheme Button */}
                    {result.paper.marking_scheme_url !== "/nopaper" ? (
                      <Link
                        href={createViewUrl(result.paper, 'ms', result.subject, result.unit)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View marking scheme for ${result.subject.name} ${result.unit.name}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium 
                          bg-secondary text-white rounded-full hover:opacity-90
                          transition-all shadow-sm hover:shadow active:scale-[0.98]
                          touch-manipulation"
                        style={{ 
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        <span className="whitespace-nowrap">MS</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium 
                          bg-surface-alt text-text-muted rounded-full cursor-not-allowed
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
                        <span className="whitespace-nowrap">No MS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Infinite scroll loader */}
            {(hasMore || isSearching) && (
              <div
                ref={observerTarget}
                className="flex justify-center py-8 items-center"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
          </div>
        ) : query.text ? (
          <div className="px-4 py-12 text-center text-text-muted">
            <div className="inline-flex flex-col items-center">
              <svg className="w-12 h-12 mb-4 text-text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                   strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p className="text-lg">No papers found</p>
              <p className="mt-1 text-sm">Try another search term or filter</p>
            </div>
          </div>
        ) : (
          <div className="px-3 sm:px-4 py-4 space-y-6">
            {/* Recent Searches */}
            {recentSearches?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2">
                  Recent Searches:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((recent: SearchQuery, index: number) => (
                    <button
                      key={`recent-${index}`}
                      onClick={() => updateQuery(recent)}
                      className="px-3 py-2 text-sm bg-surface-alt text-text rounded-full
                        hover:bg-surface-alt/80 transition-colors active:scale-[0.98]"
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    >
                      {recent.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips with improved layout */}
            <div className="text-center text-sm text-text-muted pt-4 border-t border-border">
              <p className="font-medium mb-2">Quick Search Tips:</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                  Type to search any paper
                </li>
                <li className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                  Use filters above for quick access
                </li>
                <li className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                  Try searching by subject, unit, or year
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}