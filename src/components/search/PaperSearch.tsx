import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import SearchBox from './SearchBox';
import { getTrendingSearches, logSearchQuery } from '@/utils/search/trending';

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

  // Get trending searches
  const [trendingSearches, setTrendingSearches] = React.useState<string[]>([]);
  
  // Format suggestions for the search box
  const searchSuggestions = useMemo(() => {
    // When user is typing, show search suggestions
    if (query.text) {
      return suggestions.map(s => s.text);
    }
    // When search is empty, show trending searches
    return trendingSearches;
  }, [suggestions, trendingSearches, query.text]);

  React.useEffect(() => {
    setTrendingSearches(getTrendingSearches());
  }, []);

  // Log successful searches
  React.useEffect(() => {
    if (results.length > 0 && query.text) {
      logSearchQuery(query.text);
      setTrendingSearches(getTrendingSearches()); // Refresh trending
    }
  }, [results.length, query.text]);

  const handleSuggestionSelect = (text: string) => {
    if (suggestions.find(s => s.text === text)) {
      // Handle suggestion selection
      const suggestion = suggestions.find(s => s.text === text);
      if (suggestion) {
        if (suggestion.type === 'subject') {
          updateQuery({ subject: suggestion.value });
        } else if (suggestion.type === 'unit') {
          updateQuery({ unit: suggestion.value });
        }
      }
    } else {
      // Handle trending search selection
      updateQuery({ text });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Box */}
      <SearchBox
        value={query.text}
        onChange={(text) => updateQuery({ text })}
        onClear={clearSearch}
        placeholder="Try: 'phy mech jan 24' or 'chem u1 oct'"
        suggestions={searchSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
      />

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2 mt-2">
        {query.subject && (
          <button
            onClick={() => updateQuery({ subject: undefined })}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 
              rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            Subject: {query.subject} ✕
          </button>
        )}
        {query.unit && (
          <button
            onClick={() => updateQuery({ unit: undefined })}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 
              rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            Unit: {query.unit} ✕
          </button>
        )}
        {query.year && (
          <button
            onClick={() => updateQuery({ year: undefined })}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 
              rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            Year: {query.year} ✕
          </button>
        )}
      </div>

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
                <li>• Use short forms: "phy mech jan 24"</li>
                <li>• Search by unit: "p1 oct" or "u2 jun"</li>
                <li>• Filter by year: "chem 2023"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}