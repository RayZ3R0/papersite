'use client';

import { useState, useRef, useEffect } from 'react';
import type { ParsedSearch } from '@/utils/search/parseSearchQuery';

interface AnnotateSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  suggestions?: string[];
  parsedQuery?: ParsedSearch;
  formattedQuery?: string;
  isSearching?: boolean;
  placeholder?: string;
}

export default function AnnotateSearchBox({
  value,
  onChange,
  onClear,
  suggestions = [],
  parsedQuery,
  formattedQuery,
  isSearching = false,
  placeholder = "Try: 'phy u1 jan 24' or 'chem u1 oct'"
}: AnnotateSearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-background pl-10 pr-12 py-3 rounded-lg border
            text-text placeholder:text-text-muted transition-all duration-200
            ${isFocused 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-border hover:border-border-hover'}`}
        />

        {/* Search Icon */}
        <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
            transition-colors duration-200
            ${isFocused ? 'text-primary' : 'text-text-muted'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading Spinner */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          </div>
        )}

        {/* Clear Button */}
        {value && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
              hover:bg-surface-alt rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Details */}
      {value && formattedQuery && (
        <div className="mt-2 text-sm text-text-muted">
          {formattedQuery}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 py-1 bg-surface rounded-lg 
            border border-border shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              className="w-full px-4 py-2 text-left text-sm hover:bg-surface-alt 
                transition-colors text-text flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-text-muted flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}