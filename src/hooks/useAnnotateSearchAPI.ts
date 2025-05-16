import { useState, useMemo, useCallback, useEffect } from 'react';
import { parseSearchQuery, formatSearchQuery } from '@/utils/search/parseSearchQuery';
import type { ParsedSearch } from '@/utils/search/parseSearchQuery';
import { papersApi, type Paper, type SubjectWithStats } from '@/lib/api/papers';

export interface SearchResult {
  subject: SubjectWithStats;
  unit: { id: string; name: string };
  papers: Paper[];
}

export interface Option {
  id: string;
  label: string;
  count: number;
}

export function useAnnotateSearchAPI() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subjects on mount
  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await papersApi.getSubjects();
        setSubjects(data);
      } catch (err) {
        setError('Failed to load subjects');
        console.error('Error loading subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  // Parse the search query
  const parsedQuery = useMemo(() => {
    return parseSearchQuery(query);
  }, [query]);

  // Get unique years and sessions from all papers
  const { yearOptions, sessionOptions } = useMemo(() => {
    const years = new Set<number>();
    const sessions = new Set<string>();

    subjects.forEach(subject => {
      // Traverse units to get all papers
      subject.units.forEach(async unit => {
        try {
          const papers = await papersApi.getUnitPapers(subject.id, unit.id);
          papers.forEach(paper => {
            years.add(paper.year);
            sessions.add(paper.session);
          });
        } catch (err) {
          console.error('Error loading papers:', err);
        }
      });
    });

    return {
      yearOptions: Array.from(years)
        .sort((a, b) => b - a)
        .map(year => ({
          id: year.toString(),
          label: year.toString(),
          count: 0 // Count will be updated when filtering
        })),
      sessionOptions: Array.from(sessions)
        .sort()
        .map(session => ({
          id: session,
          label: session,
          count: 0 // Count will be updated when filtering
        }))
    };
  }, [subjects]);

  // Generate search suggestions based on current query
  const suggestions = useMemo(() => {
    if (!query || !subjects.length) return [];
    
    const suggestions: string[] = [];

    // If we have a subject match
    if (parsedQuery.subject) {
      const subject = subjects.find(s => s.id === parsedQuery.subject);

      if (subject) {
        // Add unit suggestions if no unit selected
        if (!parsedQuery.unit) {
          subject.units.forEach(unit => {
            const unitNum = unit.id.replace('unit', '');
            suggestions.push(`${parsedQuery.subject} u${unitNum}`);
          });
        }

        // Add recent session suggestions
        if (!parsedQuery.session && !parsedQuery.year) {
          subject.units.forEach(async unit => {
            try {
              const papers = await papersApi.getUnitPapers(subject.id, unit.id);
              const recentPapers = papers
                .sort((a, b) => b.year - a.year)
                .slice(0, 3);

              recentPapers.forEach(paper => {
                const suggestion = parsedQuery.unit
                  ? `${parsedQuery.subject} u${parsedQuery.unit} ${paper.session.toLowerCase()} ${paper.year}`
                  : `${parsedQuery.subject} ${paper.session.toLowerCase()} ${paper.year}`;
                if (!suggestions.includes(suggestion)) {
                  suggestions.push(suggestion);
                }
              });
            } catch (err) {
              console.error('Error loading papers for suggestions:', err);
            }
          });
        }
      }
    } else {
      // Suggest from all subjects
      const recentSubjects = subjects.slice(0, 3);
      recentSubjects.forEach(subject => {
        suggestions.push(subject.id);
      });
    }

    return suggestions;
  }, [query, parsedQuery, subjects]);

  // Search papers based on query
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await papersApi.searchPapers(query);
      
      // Group results by subject and unit
      const groupedResults = new Map<string, Map<string, Paper[]>>();
      
      for (const paper of searchResults) {
        if (!paper.subject_name) continue;
        
        const subject = subjects.find(s => s.name === paper.subject_name);
        if (!subject) continue;

        if (!groupedResults.has(subject.id)) {
          groupedResults.set(subject.id, new Map());
        }

        const unitMap = groupedResults.get(subject.id)!;
        if (!unitMap.has(paper.unit_id)) {
          unitMap.set(paper.unit_id, []);
        }

        unitMap.get(paper.unit_id)!.push(paper);
      }

      // Convert to SearchResult format
      const formattedResults: SearchResult[] = [];

      for (const [subjectId, unitMap] of groupedResults) {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) continue;

        for (const [unitId, papers] of unitMap) {
          const unit = subject.units.find(u => u.id === unitId);
          if (!unit) continue;

          formattedResults.push({
            subject,
            unit,
            papers: papers.sort((a, b) => {
              if (a.year !== b.year) return b.year - a.year;
              
              const sessionOrder: Record<string, number> = {
                'October': 3,
                'May': 2,
                'June': 2,
                'January': 1
              };

              return (sessionOrder[b.session] || 0) - (sessionOrder[a.session] || 0);
            })
          });
        }
      }

      setResults(formattedResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [query, subjects]);

  // Update search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [performSearch]);

  // Handle search updates
  const updateSearch = useCallback((newQuery: string) => {
    setIsSearching(true);
    setQuery(newQuery);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setIsSearching(false);
    setResults([]);
  }, []);

  return {
    query,
    parsedQuery,
    formattedQuery: formatSearchQuery(parsedQuery),
    results,
    suggestions,
    subjects,
    isSearching,
    loading,
    error,
    yearOptions,
    sessionOptions,
    updateSearch,
    clearSearch
  };
}