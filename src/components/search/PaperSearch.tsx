'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import SearchBox from './SearchBox';
import FilterBox, { FilterItem } from './FilterBox';
import { getTrendingSearches, logSearchQuery } from '@/utils/search/trending';
import subjectsData from '@/lib/data/subjects.json';
import { Subject } from '@/types/subject';

interface SubjectsData {
  subjects: {
    [key: string]: Subject;
  };
}

const FILTERS_VISIBLE_KEY = 'papersite:filters-visible';

export default function PaperSearch() {
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
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = React.useState<string[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FILTERS_VISIBLE_KEY) === 'true';
    }
    return false;
  });

  // Get trending searches
  const [trendingSearches, setTrendingSearches] = React.useState<string[]>([]);

  // Save filter visibility preference
  React.useEffect(() => {
    localStorage.setItem(FILTERS_VISIBLE_KEY, showFilters.toString());
  }, [showFilters]);

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
  React.useEffect(() => {
    setTrendingSearches(getTrendingSearches());
  }, []);

  // Log successful searches
  React.useEffect(() => {
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
        className="w-full mb-4 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 
          flex items-center justify-between transition-colors
          rounded-lg border border-gray-200 hover:border-gray-300 bg-white
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
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
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
            Filters active
          </span>
        )}
      </button>

      {/* Filter Section with proper spacing */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-white
          ${showFilters 
            ? 'max-h-[500px] opacity-100 mb-6 border border-gray-100 rounded-lg py-4' 
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
        onChange={(text) => updateQuery({ text })}
        onClear={clearSearch}
        placeholder="Try: 'phy mech jan 24' or 'chem u1 oct'"
        suggestions={suggestions.map(s => s.text)}
      />

      {/* Results Section */}
      <div className="mt-4">
        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y" role="list">
            {results.map((result) => (
              <div 
                key={result.paper.id} 
                className="py-4 hover:bg-gray-50 transition-colors"
                role="listitem"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {result.subject.name} - {result.unit.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {result.paper.session} {result.paper.year}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={result.paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded 
                        hover:bg-blue-100 transition-colors"
                    >
                      Paper
                    </Link>
                    <Link
                      href={result.paper.markingSchemeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded
                        hover:bg-green-100 transition-colors"
                    >
                      MS
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query.text ? (
          <div className="py-8">
            <p className="text-center text-gray-500 mb-4">No papers found</p>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Recent Searches */}
            {recentSearches?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches:</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((recent, index) => (
                    <button
                      key={index}
                      onClick={() => updateQuery(recent)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full
                        hover:bg-gray-200 transition-colors"
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
                <h3 className="text-sm font-medium text-gray-500 mb-2">Popular Searches:</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => updateQuery({ text: search })}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full
                        hover:bg-blue-100 transition-colors group"
                    >
                      <span className="group-hover:underline">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
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
  );
}