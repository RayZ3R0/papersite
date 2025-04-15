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
import { getPaperCode } from "@/utils/paperCodes";
import SearchBox from "./SearchBox";
import FilterBox from "./FilterBox";
import { getTrendingSearches, logSearchQuery } from "@/utils/search/trending";
import subjectsData from "@/lib/data/subjects.json";
import { motion, AnimatePresence } from "framer-motion";
import type { Subject } from "@/types/subject";
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

const FILTERS_VISIBLE_KEY = "papersite:filters-visible";

export default function PaperSearch({ initialQuery = "" }: PaperSearchProps) {
  const {
    query,
    results,
    suggestions,
    isSearching,
    updateQuery,
    clearSearch,
    recentSearches,
  } = useSearch({ debounceMs: 300 });

  // Search focus handling
  const searchRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const animSettings = useMemo(() => getAnimationSettings(), []);

  // Auto focus if coming from homepage
  useEffect(() => {
    if (searchParams.get("focus") === "true" && searchRef.current) {
      // On mobile, delay focusing to prevent keyboard popping up immediately
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const timer = setTimeout(() => {
          searchRef.current?.focus();
        }, 500);
        return () => clearTimeout(timer);
      } else {
        searchRef.current.focus();
      }
    }
  }, [searchParams]);

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

  // For delayed loading (improves initial paint speed)
  const [loadedFilters, setLoadedFilters] = useState(false);
  useEffect(() => {
    // Small delay to improve initial load performance
    const timer = setTimeout(() => {
      setLoadedFilters(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get trending searches
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

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
      count: subject.papers.filter((p) => p.unitId === unit.id).length,
      isSelected: selectedUnits.includes(unit.id),
    }));
  }, [selectedSubject, selectedUnits]);

  // Get recent sessions
  const sessionFilters = useMemo(() => {
    const allPapers = Object.values(
      castSubjectsData(subjectsData).subjects
    ).flatMap((s) => s.papers);
    const sessions = Array.from(
      new Set(allPapers.map((p) => `${p.session} ${p.year}`))
    ).sort((a, b) => {
      const [, yearA] = a.split(" ");
      const [, yearB] = b.split(" ");
      return Number(yearB) - Number(yearA);
    });

    return sessions.slice(0, 6).map((session) => ({
      id: session,
      name: session,
      count: allPapers.filter((p) => `${p.session} ${p.year}` === session)
        .length,
      isSelected: selectedSession === session,
    }));
  }, [selectedSession]);

  // Handle filter selections
  const handleSubjectSelect = useCallback(
    (id: string) => {
      setSelectedSubject(id);
      setSelectedUnits([]);
      updateQuery({
        subject: castSubjectsData(subjectsData).subjects[id].name,
      });
    },
    [updateQuery]
  );

  const handleSubjectDeselect = useCallback(() => {
    setSelectedSubject(null);
    setSelectedUnits([]);
    updateQuery({ subject: undefined });
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
      updateQuery({ unit: undefined });
    },
    [updateQuery]
  );

  const handleSessionSelect = useCallback(
    (id: string) => {
      setSelectedSession(id);
      const [month, year] = id.split(" ");
      updateQuery({
        session: month,
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

  // Load trending searches on mount with delay for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrendingSearches(getTrendingSearches());
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Log successful searches
  useEffect(() => {
    if (results.length > 0 && query.text) {
      logSearchQuery(query.text);
      setTrendingSearches(getTrendingSearches());
    }
  }, [results.length, query.text]);

  // Get subject papers for a specific subject
  const getSubjectPapers = useCallback((subjectId: string) => {
    const subject = castSubjectsData(subjectsData).subjects[subjectId];
    return subject?.papers || [];
  }, []);

return (
  // Change from "w-full max-w-2xl mx-auto" to fully support mobile:
  <div className="w-full max-w-2xl mx-auto mobile-container-fix">
    {/* Filter Toggle - improved for touch */}
    <button
      onClick={() => setShowFilters((prev) => !prev)}
      className={`w-full mb-4 px-3 sm:px-4 py-3 text-sm
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
              />

              {selectedSubject && (
                <FilterBox
                  title="Units"
                  items={unitFilters}
                  onSelect={handleUnitSelect}
                  onDeselect={handleUnitDeselect}
                  multiSelect={true}
                />
              )}

              <FilterBox
                title="Recent Sessions"
                items={sessionFilters}
                onSelect={handleSessionSelect}
                onDeselect={handleSessionDeselect}
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
            {results.map((result: SearchResult, index) => (
              <div
                key={result.paper.id}
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
                      {result.paper.session} {result.paper.year}
                      {getPaperCode(
                        {
                          subject: result.subject.id,
                          unitId: result.paper.unitId,
                          year: result.paper.year,
                          title: result.paper.title,
                          pdfUrl: result.paper.pdfUrl,
                          session: result.paper.session,
                        },
                        getSubjectPapers(result.subject.id)
                      ) && (
                        <span className="text-xs ml-2">
                          {getPaperCode(
                            {
                              subject: result.subject.id,
                              unitId: result.paper.unitId,
                              year: result.paper.year,
                              title: result.paper.title,
                              pdfUrl: result.paper.pdfUrl,
                              session: result.paper.session,
                            },
                            getSubjectPapers(result.subject.id)
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Mobile-friendly action buttons with visual feedback */}
                <div className="flex gap-2 sm:gap-2.5 sm:ml-6 mx-0 sm:-mx-1 sm:mx-0">
                  <Link
                    href={result.paper.pdfUrl}
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
                  <Link
                    href={result.paper.markingSchemeUrl}
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
                </div>
              </div>
            ))}
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
                      key={index}
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

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2">
                  Popular Searches:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => updateQuery({ text: search })}
                      className="px-3 py-2 text-sm bg-primary/10 text-primary rounded-full
                        hover:bg-primary/20 transition-colors group active:scale-[0.98]"
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    >
                      <span className="group-hover:underline">{search}</span>
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