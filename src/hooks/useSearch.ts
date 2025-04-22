import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchQuery, SearchResult, SearchSuggestion } from '@/types/search';
import { papersApi } from '@/lib/api/papers';
import subjectsData from '@/lib/data/subjects.json';
import type { Subject, Paper } from '@/types/subject';

interface UseSearchOptions {
  debounceMs?: number;
  maxRecentSearches?: number;
  pageSize?: number;
}

// Map of math unit abbreviations to their full names
const mathUnitAbbreviations: Record<string, string> = {
  's1': 'statistics 1',
  's2': 'statistics 2',
  's3': 'statistics 3',
  's4': 'statistics 4',
  'm1': 'mechanics 1',
  'm2': 'mechanics 2',
  'm3': 'mechanics 3',
  'm4': 'mechanics 4',
  'm5': 'mechanics 5',
  'fp1': 'further pure 1',
  'fp2': 'further pure 2',
  'fp3': 'further pure 3',
  'p1': 'pure 1',
  'p2': 'pure 2',
  'p3': 'pure 3',
  'p4': 'pure 4',
  'd1': 'decision 1',
  'd2': 'decision 2',
  // Add these additional mappings
  'pure1': 'pure 1',
  'pure2': 'pure 2',
  'pure3': 'pure 3',
  'pure4': 'pure 4',
  'mech1': 'mechanics 1',
  'mech2': 'mechanics 2',
  'mech3': 'mechanics 3',
  'stats1': 'statistics 1',
  'stats2': 'statistics 2',
  'stats3': 'statistics 3'
};

// Helper function to get subject and unit data
function getSubjectAndUnitInfo(unitId: string, paperData?: Paper) {
  // If paperData includes subject_name, use it directly
  if (paperData && 'subject_name' in paperData) {
    const subjectName = paperData.subject_name as string;
    const subjectId = subjectName.toLowerCase().replace(/\s+/g, '_');
    
    // Try to extract unit number from unit_id or title
    let unitName = "Unknown Unit";
    
    // Try to get unit name from title
    if (paperData.title) {
      // Extract unit name from title like "Psychology Unit 2 (IAL) - January 2018"
      const unitMatch = paperData.title.match(/Unit\s+(\d+)|Paper\s+(\d+)/i);
      if (unitMatch) {
        const unitNumber = unitMatch[1] || unitMatch[2];
        unitName = `Unit ${unitNumber}`;
      }
    }
    
    // If not found in title, try to extract from unit_id
    if (unitName === "Unknown Unit" && unitId) {
      const match = unitId.match(/unit(\d+)/i);
      if (match && match[1]) {
        unitName = `Unit ${match[1]}`;
      }
    }
    
    return {
      subject: { 
        id: subjectId, 
        name: subjectName,
        units: [],  
        papers: []
      },
      unit: { 
        id: unitId, 
        name: unitName,
        order: 0 
      }
    };
  }
  
  // Fall back to checking subjects data
  const subjects = (subjectsData as any).subjects || {};
  
  // Find the subject that contains this unit
  for (const subjectId in subjects) {
    const subject = subjects[subjectId];
    const unit = subject.units.find((u: any) => u.id === unitId);
    
    if (unit) {
      return {
        subject: {
          id: subjectId,
          name: subject.name,
          units: subject.units || [],
          papers: subject.papers || []
        },
        unit: {
          id: unitId,
          name: unit.name,
          order: unit.order || 0
        }
      };
    }
  }
  
  // Special case for math units
  if (unitId) {
    const unitLower = unitId.toLowerCase();
    
    // 1. Direct lookup in our abbreviations dictionary
    if (mathUnitAbbreviations[unitLower]) {
      return {
        subject: { 
          id: 'maths', 
          name: 'Mathematics',
          units: [],  
          papers: []
        },
        unit: { 
          id: unitId, 
          name: mathUnitAbbreviations[unitLower]
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          order: 0 
        }
      };
    }
    
    // 2. Check for patterns in the unit ID for math units
    if (
      unitLower.includes('pure') || 
      unitLower.includes('mech') || 
      unitLower.includes('stats') || 
      unitLower.includes('fp') ||
      (unitLower.startsWith('s') && /s[1-4]/.test(unitLower)) ||
      (unitLower.startsWith('m') && /m[1-5]/.test(unitLower)) ||
      (unitLower.startsWith('p') && /p[1-4]/.test(unitLower)) ||
      (unitLower.startsWith('d') && /d[1-2]/.test(unitLower))
    ) {
      // Generate a unit name from the unitId
      let unitName = unitId
        .replace(/pure/i, 'Pure ')
        .replace(/mech/i, 'Mechanics ')
        .replace(/stats/i, 'Statistics ');
      
      // For single-letter prefixes with numbers
      if (/^[smfpd][1-5]$/i.test(unitLower)) {
        const prefix = unitLower.charAt(0);
        const number = unitLower.charAt(1);
        
        if (prefix === 's') unitName = `Statistics ${number}`;
        else if (prefix === 'm') unitName = `Mechanics ${number}`;
        else if (prefix === 'p') unitName = `Pure ${number}`;
        else if (prefix === 'd') unitName = `Decision ${number}`;
        else if (prefix === 'f' && unitLower.startsWith('fp')) unitName = `Further Pure ${unitLower.charAt(2)}`;
      }
      
      return {
        subject: { 
          id: 'maths', 
          name: 'Mathematics',
          units: [],  
          papers: []
        },
        unit: { 
          id: unitId, 
          name: unitName,
          order: 0 
        }
      };
    }
  }
  
  // If not found, generate a basic name from the unit_id
  let unitName = "Unknown Unit";
  
  if (unitId) {
    // Convert 'unit1' to 'Unit 1'
    const match = unitId.match(/unit(\d+)/i);
    if (match && match[1]) {
      unitName = `Unit ${match[1]}`;
    }
  }
  
  return {
    subject: { 
      id: '', 
      name: 'Unknown Subject',
      units: [],
      papers: []
    },
    unit: { id: unitId, name: unitName, order: 0 }
  };
}

// Helper to expand math abbreviations in the search query
function expandMathAbbreviations(query: string): string {
  if (!query) return query;
  
  const lowerQuery = query.toLowerCase().trim();
  // Regex to match standalone math abbreviations like s1, m2, fp3, etc.
  const matches = lowerQuery.match(/\b([smfpd][1-5]|fp[1-3])\b/g);
  
  if (matches && matches.length > 0) {
    // If we find math unit abbreviations, prepend "maths" if it's not already there
    if (!lowerQuery.includes('math')) {
      return `maths ${query}`;
    }
  }
  
  return query;
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
  const { 
    debounceMs = 300, 
    maxRecentSearches = 5,
    pageSize = 20 
  } = options;
  
  const [query, setQuery] = useState<SearchQuery>({ text: '' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
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

  // Memoized search function
  const performSearch = useCallback(async (searchQuery: SearchQuery, page: number) => {
    setIsSearching(true);
    setError(null);

    // Cancel any in-flight search request
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    // Create a new abort controller for this search
    searchAbortController.current = new AbortController();

    try {
      // Only search if we have a query
      if (searchQuery.text.trim()) {
        // Expand math abbreviations in the query
        const expandedText = expandMathAbbreviations(searchQuery.text);
        
        // Build the search query string
        const searchText = [
          expandedText, // Use the expanded text
          searchQuery.subject,
          searchQuery.unit,
          searchQuery.session,
          searchQuery.year?.toString()
        ].filter(Boolean).join(' ');

        const papers = await papersApi.searchPapers(searchText, page, pageSize);

        // Convert API results to SearchResult format
        const searchResults: SearchResult[] = papers.map(paper => {
          // Get subject and unit information from our local data
          const { subject, unit } = getSubjectAndUnitInfo(paper.unit_id, paper);
          
          return {
            paper: {
              id: paper.id,
              unit_id: paper.unit_id,
              year: paper.year,
              session: paper.session,
              pdf_url: paper.pdf_url,
              marking_scheme_url: paper.marking_scheme_url,
              title: paper.title,
              unit_code: paper.unit_code,
              subject_name: paper.subject_name
            },
            unit,
            subject,
            score: 1,
            matches: {
              text: true,
              subject: true,
              unit: true,
              year: true,
              session: true
            }
          };
        });

        if (page === 1) {
          setResults(searchResults);
        } else {
          setResults(prev => [...prev, ...searchResults]);
        }

        setTotal(papers.length);
        setHasMore(false); // Since we're getting all results at once
        setCurrentPage(1);

        // Store successful searches (using the original query, not expanded)
        if (searchResults.length > 0 && searchQuery.text) {
          const searches = getStoredSearches();
          const newSearches = [
            searchQuery,
            ...searches.filter(s => s.text !== searchQuery.text)
          ].slice(0, maxRecentSearches);
          
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
          setRecentSearches(newSearches);
        }
      } else {
        // Clear results if query is empty
        setResults([]);
        setSuggestions([]);
        setTotal(0);
        setHasMore(false);
        setCurrentPage(1);
      }
    } catch (err) {
      if (searchAbortController.current?.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [pageSize, maxRecentSearches]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: SearchQuery, page: number = 1) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Use a longer debounce on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const mobileDebounceMs = isMobile ? debounceMs * 1.5 : debounceMs;

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery, page);
    }, mobileDebounceMs);
  }, [debounceMs, performSearch]);

  // Update search when query changes
  useEffect(() => {
    debouncedSearch(query, 1); // Reset to first page on new search

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

  // Function to load more results
  const loadMore = useCallback(() => {
    if (!isSearching && hasMore) {
      debouncedSearch(query, currentPage + 1);
    }
  }, [query, currentPage, hasMore, isSearching, debouncedSearch]);

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
    setCurrentPage(1);
    setHasMore(false);
    setTotal(0);
  }, []);

  return {
    query,
    results,
    suggestions,
    isSearching,
    error,
    updateQuery,
    clearSearch,
    recentSearches,
    // Pagination-related
    currentPage,
    hasMore,
    total,
    loadMore
  };
}