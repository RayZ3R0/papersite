import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchQuery, SearchResult, SearchSuggestion } from '@/types/search';
import { searchPapers } from '@/utils/search/core';
import { SubjectsData } from '@/types/subject';
import subjectsData from '@/lib/data/subjects.json';

// Type assertion helper
const castSubjectsData = (data: any): SubjectsData => data as SubjectsData;

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

function normalizeSession(session: string | undefined): string[] {
  if (!session) return [];
  
  const normalized = session.toLowerCase().trim();
  
  // Handle May/June as a special case
  if (normalized === 'may' || normalized === 'june') {
    return ['may', 'june'];
  }
  
  return [normalized];
}

// Function to deduplicate search results based on pdfUrl
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const urlSet = new Set<string>();
  return results.filter(result => {
    // If we've seen this URL before, filter it out
    if (urlSet.has(result.paper.pdfUrl)) {
      return false;
    }
    // Otherwise, record this URL and keep the result
    urlSet.add(result.paper.pdfUrl);
    return true;
  });
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
  const searchAbortController = useRef<AbortController | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    // On mobile, delay loading to improve initial page load speed
    if (isMobile) {
      const timer = setTimeout(() => {
        setRecentSearches(getStoredSearches());
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setRecentSearches(getStoredSearches());
    }
  }, []);

  // Generate quick suggestions based on current input
  const generateSuggestions = useCallback((searchQuery: SearchQuery) => {
    const text = searchQuery.text.toLowerCase().trim();
    if (!text) return [];

    const suggestions: SearchSuggestion[] = [];

    // Unit suggestions if subject is known
    if (searchQuery.subject) {
      const subject = castSubjectsData(subjectsData).subjects[searchQuery.subject.toLowerCase()];
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

  // Memoized search function - now with abort controller for cancellation
  const performSearch = useCallback((searchQuery: SearchQuery) => {
    setIsSearching(true);
    setError(null);

    // Cancel any in-flight search request
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    // Create a new abort controller for this search
    searchAbortController.current = new AbortController();

    try {
      // Delay slightly to allow for UI updates
      setTimeout(() => {
        try {
          // Check if this search was canceled
          if (searchAbortController.current?.signal.aborted) return;
          
          const { results: searchResults, suggestions: searchSuggestions } = 
            searchPapers(searchQuery, castSubjectsData(subjectsData));

          // Deduplicate results to ensure no double entries
          const uniqueResults = deduplicateResults(searchResults);
          
          setResults(uniqueResults.slice(0, maxResults));

          // Merge search suggestions with quick suggestions
          const quickSuggestions = generateSuggestions(searchQuery);
          setSuggestions([...quickSuggestions, ...searchSuggestions]);

          // Store successful searches - but not on mobile to avoid excessive storage writes
          if (uniqueResults.length > 0 && searchQuery.text && typeof window !== 'undefined' && window.innerWidth >= 768) {
            const searches = getStoredSearches();
            const newSearches = [
              searchQuery,
              ...searches.filter(s => s.text !== searchQuery.text)
            ].slice(0, maxRecentSearches);
            
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
            setRecentSearches(newSearches);
          }
        } catch (err) {
          if (searchAbortController.current?.signal.aborted) return;
          setError(err instanceof Error ? err.message : 'Search failed');
          setResults([]);
          setSuggestions(generateSuggestions(searchQuery));
        } finally {
          setIsSearching(false);
        }
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSuggestions(generateSuggestions(searchQuery));
      setIsSearching(false);
    }
  }, [maxResults, maxRecentSearches, generateSuggestions]);

  // Debounced search - with longer delay on mobile
  const debouncedSearch = useCallback((searchQuery: SearchQuery) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Always update suggestions immediately for better UX
    setSuggestions(generateSuggestions(searchQuery));

    // Use a longer debounce on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const mobileDebounceMs = isMobile ? debounceMs * 1.5 : debounceMs;

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, mobileDebounceMs);
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
      if (searchAbortController.current) {
        searchAbortController.current.abort();
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
    // Cancel any in-flight search
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    
    setQuery({ text: '' });
    setResults([]);
    setSuggestions([]);
    setError(null);
  }, []);

  // Store successful searches when component unmounts
  // This ensures we save the most recent search when navigating away
  useEffect(() => {
    return () => {
      if (results.length > 0 && query.text) {
        const searches = getStoredSearches();
        const newSearches = [
          query,
          ...searches.filter(s => s.text !== query.text)
        ].slice(0, maxRecentSearches);
        
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      }
    };
  }, [query, results.length, maxRecentSearches]);

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