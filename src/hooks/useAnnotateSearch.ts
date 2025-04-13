import { useState, useMemo, useCallback } from 'react';
import { parseSearchQuery, paperMatchesSearch, formatSearchQuery } from '@/utils/search/parseSearchQuery';
import type { SubjectsData, Subject, Paper } from '@/types/subject';
import type { ParsedSearch } from '@/utils/search/parseSearchQuery';

interface SearchResult {
  subject: Subject;
  unit: { id: string; name: string };
  papers: Paper[];
}

// Helper to get valid papers (with PDF URLs)
function getValidPapers(papers: Paper[]) {
  return papers.filter(p => p.pdfUrl.toLowerCase().endsWith('.pdf'));
}

export function useAnnotateSearch(subjectsData: SubjectsData) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Parse the search query
  const parsedQuery = useMemo(() => {
    return parseSearchQuery(query);
  }, [query]);

  // Generate search suggestions based on current query
  const suggestions = useMemo(() => {
    if (!query) return [];
    
    const suggestions: string[] = [];

    // If we have a subject match
    if (parsedQuery.subject) {
      const subject = Object.values(subjectsData.subjects).find(
        s => s.id === parsedQuery.subject
      );

      if (subject) {
        const validPapers = getValidPapers(subject.papers);

        // Add unit suggestions if no unit selected
        if (!parsedQuery.unit) {
          subject.units.forEach(unit => {
            // Only suggest if there are valid papers for this unit
            const unitPapers = validPapers.filter(p => p.unitId === unit.id);
            if (unitPapers.length > 0) {
              const unitNum = unit.id.replace('unit', '');
              suggestions.push(`${parsedQuery.subject} u${unitNum}`);
            }
          });
        }

        // Add session suggestions if no session/year selected
        if (!parsedQuery.session && !parsedQuery.year) {
          const recentPapers = validPapers
            .sort((a, b) => b.year - a.year)
            .slice(0, 3);

          recentPapers.forEach(paper => {
            const suggestion = parsedQuery.unit
              ? `${parsedQuery.subject} u${parsedQuery.unit} ${paper.session.toLowerCase()} ${paper.year}`
              : `${parsedQuery.subject} ${paper.session.toLowerCase()} ${paper.year}`;
            suggestions.push(suggestion);
          });
        }
      }
    } else {
      // Suggest most recent papers from all subjects
      const allValidPapers = Object.values(subjectsData.subjects)
        .flatMap(subject => 
          getValidPapers(subject.papers)
            .map(p => ({ ...p, subject: subject.id }))
        )
        .sort((a, b) => b.year - a.year)
        .slice(0, 3);

      allValidPapers.forEach(paper => {
        suggestions.push(
          `${paper.subject} ${paper.session.toLowerCase()} ${paper.year}`
        );
      });
    }

    return suggestions;
  }, [query, parsedQuery, subjectsData.subjects]);

  // Search papers based on query
  const results = useMemo(() => {
    const results: SearchResult[] = [];

    // If no query, return empty results
    if (!query.trim()) {
      return results;
    }

    // Search through subjects
    Object.values(subjectsData.subjects).forEach(subject => {
      // Group valid papers by unit
      const unitPapers = new Map<string, Paper[]>();

      // Filter and group papers
      getValidPapers(subject.papers).forEach(paper => {
        if (paperMatchesSearch(paper, subject, parsedQuery)) {
          const papers = unitPapers.get(paper.unitId) || [];
          papers.push(paper);
          unitPapers.set(paper.unitId, papers);
        }
      });

      // If we found matching papers, add to results
      if (unitPapers.size > 0) {
        subject.units.forEach(unit => {
          const papers = unitPapers.get(unit.id);
          if (papers?.length) {
            results.push({
              subject,
              unit,
              papers: papers.sort((a, b) => {
                // Sort by year first
                if (a.year !== b.year) {
                  return b.year - a.year;
                }

                // Then by session (Oct -> May/June -> Jan)
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
        });
      }
    });

    return results;
  }, [query, parsedQuery, subjectsData.subjects]);

  // Handle search updates
  const updateSearch = useCallback((newQuery: string) => {
    setIsSearching(true);
    setQuery(newQuery);
    // Add artificial delay to show loading state
    setTimeout(() => setIsSearching(false), 300);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setIsSearching(false);
  }, []);

  return {
    query,
    parsedQuery,
    formattedQuery: formatSearchQuery(parsedQuery),
    results,
    suggestions,
    isSearching,
    updateSearch,
    clearSearch
  };
}