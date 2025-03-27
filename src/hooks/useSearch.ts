import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchQuery, SearchResult, SearchSuggestion } from '@/types/search';
import { searchPapers } from '@/utils/search/core';
import { SubjectsData } from '@/types/subject';
import subjectsData from '@/lib/data/subjects.json';

interface UseSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  maxRecentSearches?: number;
}

const RECENT_SEARCHES_KEY = 'papersite:recent-searches';

function getStoredSearches(): SearchQuery[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, maxResults = 20, maxRecentSearches = 5 } = options;
  
  const [query, setQuery] = useState<SearchQuery>({ text: '' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([]);
  
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  // Generate quick suggestions based on current input
  const generateSuggestions = useCallback((searchQuery: SearchQuery) => {
    const text = searchQuery.text.toLowerCase().trim();
    if (!text) return [];

    const suggestions: SearchSuggestion[] = [];

    // Subject matches and common patterns sections removed

    // Unit suggestions if subject is known
    if (searchQuery.subject) {
      const subject = (subjectsData as SubjectsData).subjects[searchQuery.subject.toLowerCase()];
      if (subject) {
        subject.units.forEach(unit => {
          suggestions.push({
            type: 'unit',
            text: unit.name,
            value: unit.name,
            score: 0.8
          });
        });
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }, []);

  // Memoized search function
  const performSearch = useCallback((searchQuery: SearchQuery) => {
    setIsSearching(true);
    setError(null);

    try {
      const { results: searchResults, suggestions: searchSuggestions } = 
        searchPapers(searchQuery, subjectsData as SubjectsData);

      setResults(searchResults.slice(0, maxResults));

      // Merge search suggestions with quick suggestions
      const quickSuggestions = generateSuggestions(searchQuery);
      setSuggestions([...quickSuggestions, ...searchSuggestions]);

      // Store successful searches
      if (searchResults.length > 0 && searchQuery.text) {
        const searches = getStoredSearches();
        const newSearches = [
          searchQuery,
          ...searches.filter(s => s.text !== searchQuery.text)
        ].slice(0, maxRecentSearches);
        
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
        setRecentSearches(newSearches);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSuggestions(generateSuggestions(searchQuery));
    } finally {
      setIsSearching(false);
    }
  }, [maxResults, maxRecentSearches, generateSuggestions]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: SearchQuery) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Always update suggestions immediately for better UX
    setSuggestions(generateSuggestions(searchQuery));

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);
  }, [debounceMs, performSearch, generateSuggestions]);

  // Update search when query changes
  useEffect(() => {
    if (query.text.trim() || query.subject || query.unit || query.year || query.session) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setSuggestions([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debouncedSearch]);

  // Function to update search query
  const updateQuery = useCallback((newQuery: Partial<SearchQuery>) => {
    setQuery(current => ({
      ...current,
      ...newQuery
    }));
  }, []);

  // Function to clear search
  const clearSearch = useCallback(() => {
    setQuery({ text: '' });
    setResults([]);
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    suggestions,
    isSearching,
    error,
    updateQuery,
    clearSearch,
    recentSearches
  };
}