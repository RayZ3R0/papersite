'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import SearchBox from './SearchBox';
import FilterBox from './FilterBox';
import { getTrendingSearches, logSearchQuery } from '@/utils/search/trending';
import subjectsData from '@/lib/data/subjects.json';
import type { Subject } from '@/types/subject';
import type { SearchQuery, SearchResult } from '@/types/search';

interface SubjectsData {
  subjects: {
    [key: string]: Subject;
  };
}

interface PaperSearchProps {
  autoFocus?: boolean;
  initialQuery?: string;
}

const FILTERS_VISIBLE_KEY = 'papersite:filters-visible';

export default function PaperSearch({ autoFocus = false, initialQuery = '' }: PaperSearchProps) {
  const {
    query,
    results,
    suggestions,
    isSearching,
    updateQuery,
    clearSearch,
    recentSearches
  } = useSearch({ debounceMs: 300 });

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FILTERS_VISIBLE_KEY) === 'true';
    }
    return false;
  });

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
  const hasActiveFilters = selectedSubject || selectedUnits.length > 0 || selectedSession;

  // Transform subjects data into filter items
  const subjectFilters = useMemo(() => {
    return Object.values((subjectsData as SubjectsData).subjects).map(subject => ({
      id: subject.id,
      name: subject.name,
      count: subject.papers.length,
      isSelected: selectedSubject === subject.id
    }));
  }, [selectedSubject]);

  // Get units for selected subject
  const unitFilters = useMemo(() => {
    if (!selectedSubject) return [];
    const subject = (subjectsData as SubjectsData).subjects[selectedSubject];
    if (!subject) return [];

    return subject.units.map(unit => ({
      id: unit.id,
      name: unit.name,
      count: subject.papers.filter(p => p.unitId === unit.id).length,
      isSelected: selectedUnits.includes(unit.id)
    }));
  }, [selectedSubject, selectedUnits]);

  // Get recent sessions
  const sessionFilters = useMemo(() => {
    const allPapers = Object.values((subjectsData as SubjectsData).subjects).flatMap(s => s.papers);
    const sessions = Array.from(new Set(
      allPapers.map(p => `${p.session} ${p.year}`)
    )).sort((a, b) => {
      const [, yearA] = a.split(' ');
      const [, yearB] = b.split(' ');
      return Number(yearB) - Number(yearA);
    });

    return sessions.slice(0, 6).map(session => ({
      id: session,
      name: session,
      count: allPapers.filter(p => `${p.session} ${p.year}` === session).length,
      isSelected: selectedSession === session
    }));
  }, [selectedSession]);

  // Handle filter selections
  const handleSubjectSelect = useCallback((id: string) => {
    setSelectedSubject(id);
    setSelectedUnits([]);
    updateQuery({ subject: (subjectsData as SubjectsData).subjects[id].name });
  }, [updateQuery]);

  const handleSubjectDeselect = useCallback(() => {
    setSelectedSubject(null);
    setSelectedUnits([]);
    updateQuery({ subject: undefined });
  }, [updateQuery]);

  const handleUnitSelect = useCallback((id: string) => {
    setSelectedUnits(prev => [...prev, id]);
    if (selectedSubject) {
      const subject = (subjectsData as SubjectsData).subjects[selectedSubject];
      const unit = subject?.units.find(u => u.id === id);
      if (unit) {
        updateQuery({ unit: unit.name });
      }
    }
  }, [selectedSubject, updateQuery]);

  const handleUnitDeselect = useCallback((id: string) => {
    setSelectedUnits(prev => prev.filter(unitId => unitId !== id));
    updateQuery({ unit: undefined });
  }, [updateQuery]);

  const handleSessionSelect = useCallback((id: string) => {
    setSelectedSession(id);
    const [month, year] = id.split(' ');
    updateQuery({ 
      session: month,
      year: parseInt(year, 10)
    });
  }, [updateQuery]);

  const handleSessionDeselect = useCallback(() => {
    setSelectedSession(null);
    updateQuery({ 
      session: undefined,
      year: undefined
    });
  }, [updateQuery]);

  // Load trending searches on mount
  useEffect(() => {
    setTrendingSearches(getTrendingSearches());
  }, []);

  // Log successful searches
  useEffect(() => {
    if (results.length > 0 && query.text) {
      logSearchQuery(query.text);
      setTrendingSearches(getTrendingSearches());
    }
  }, [results.length, query.text]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(prev => !prev)}
        className={`w-full mb-4 px-4 py-2.5 text-sm
          flex items-center justify-between transition-colors
          rounded-lg border border-border hover:border-border-light
          bg-surface hover:bg-surface-alt
          focus:outline-none focus:ring-2 focus:ring-primary/30
          text-text`}
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? 'Hide filters' : 'Show filters'}
        </span>
        {hasActiveFilters && (
          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
            Filters active
          </span>
        )}
      </button>

      {/* Main Content Container */}
      <div className="rounded-lg bg-surface border border-border p-4">
        {/* Filter Section */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out mb-4
            ${showFilters 
              ? 'max-h-[500px] opacity-100' 
              : 'max-h-0 opacity-0'}`}
        >
          <div className="space-y-3">
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
        </div>

        {/* Search Box */}
        <SearchBox
          value={query.text}
          onChange={(text: string) => updateQuery({ text })}
          onClear={clearSearch}
          placeholder="Try: 'phy mech jan 24' or 'chem u1 oct'"
          suggestions={suggestions.map(s => s.text)}
          autoFocus={autoFocus}
        />

        {/* Results Section */}
        <div className="mt-4 -mx-4">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border" role="list">
              {results.map((result: SearchResult) => (
                <div 
                  key={result.paper.id} 
                  className="px-4 py-4 hover:bg-surface-alt transition-colors"
                  role="listitem"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-text truncate">
                        {result.subject.name} - {result.unit.name}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {result.paper.session} {result.paper.year}
                      </p>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <Link
                        href={result.paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium 
                          bg-primary text-white rounded-full hover:opacity-90
                          transition-all shadow-sm hover:shadow
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
                        Paper
                      </Link>
                      <Link
                        href={result.paper.markingSchemeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium 
                          bg-secondary text-white rounded-full hover:opacity-90
                          transition-all shadow-sm hover:shadow
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
                        MS
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.text ? (
            <div className="py-8 px-4">
              <p className="text-center text-text-muted">No papers found</p>
            </div>
          ) : (
            <div className="py-4 px-4 space-y-6">
              {/* Recent Searches */}
              {recentSearches?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-2">Recent Searches:</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((recent: SearchQuery, index: number) => (
                      <button
                        key={index}
                        onClick={() => updateQuery(recent)}
                        className="px-3 py-1 text-sm bg-surface-alt text-text rounded-full
                          hover:bg-surface-alt/80 transition-colors"
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
                  <h3 className="text-sm font-medium text-text-muted mb-2">Popular Searches:</h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => updateQuery({ text: search })}
                        className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full
                          hover:bg-primary/20 transition-colors group"
                      >
                        <span className="group-hover:underline">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="text-center text-sm text-text-muted pt-4 border-t border-border">
                <p className="font-medium mb-2">Quick Search Tips:</p>
                <ul className="space-y-1">
                  <li>• Type to search any paper</li>
                  <li>• Or use filters above for quick access</li>
                  <li>• Try searching by subject, unit, or year</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}