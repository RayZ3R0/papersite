import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { debounce } from '@/lib/utils/debounce';

interface FilterControlsProps {
  onSearch: (query: string) => void;
  onSessionChange: (session: string) => void;
  onYearChange: (year: string) => void;
  availableSessions: string[];
  availableYears: string[];
  isLoading?: boolean;
}

export default function FilterControls({
  onSearch,
  onSessionChange,
  onYearChange,
  availableSessions,
  availableYears,
  isLoading
}: FilterControlsProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    onSearch(value);
  }, 300);

  // Update search when URL param changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4 mb-6">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              debouncedSearch(e.target.value);
            }}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Session Filter */}
      <div className="w-full md:w-48">
        <select
          className="w-full px-4 py-2 border border-border rounded-lg bg-surface 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed"
          onChange={(e) => onSessionChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Sessions</option>
          {availableSessions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>
      </div>

      {/* Year Filter */}
      <div className="w-full md:w-48">
        <select
          className="w-full px-4 py-2 border border-border rounded-lg bg-surface 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed"
          onChange={(e) => onYearChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Years</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}