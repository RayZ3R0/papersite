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

// Recent searches are stored in localStorage
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

function storeRecentSearch(query: SearchQuery, maxItems: number) {
  if (typeof window === 'undefined') return;
  try {
    const searches = getStoredSearches();
    // Only store if there's actual search text
    if (query.text.trim()) {
      const newSearches = [
        query,
        ...searches.filter(s => s.text !== query.text)
      ].slice(0, maxItems);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    }
  } catch {
    // Ignore storage errors
  }
}

export function useSearch(options: UseSearchOptions = {}) {
  const { 
    debounceMs = 300, 
    maxResults = 20,
    maxRecentSearches = 5
  } = options;
  
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

  // Memoized search function
  const performSearch = useCallback((searchQuery: SearchQuery) => {
    setIsSearching(true);
    setError(null);

    try {
      const { results: searchResults, suggestions: searchSuggestions } = 
        searchPapers(searchQuery, subjectsData as SubjectsData);

      setResults(searchResults.slice(0, maxResults));
      setSuggestions(searchSuggestions);

      // Store in recent searches if we got results
      if (searchResults.length > 0) {
        storeRecentSearch(searchQuery, maxRecentSearches);
        setRecentSearches(getStoredSearches());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [maxResults, maxRecentSearches]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: SearchQuery) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);
  }, [debounceMs, performSearch]);

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