'use client';

import React, { useRef, KeyboardEvent, useEffect } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

export default function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Search papers...",
  className = "",
  suggestions = [],
  onSuggestionSelect
}: SearchBoxProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show suggestions when there's input and suggestions are available
  const shouldShowSuggestions = showSuggestions && 
    value.length > 0 && 
    suggestions.length > 0;

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          onSuggestionSelect?.(suggestions[selectedIndex]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Scroll suggestion into view when using keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const suggestionEl = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (suggestionEl) {
        suggestionEl.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 rounded-lg
            bg-surface border border-border
            focus:border-primary focus:ring-1 focus:ring-primary
            dark:focus:border-primary-light dark:focus:ring-primary-light
            text-text placeholder-text-muted
            outline-none transition-colors ${className}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={shouldShowSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />
        {value && (
          <button
            onClick={() => {
              onClear();
              setShowSuggestions(false);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1.5 text-text-muted hover:text-text 
              rounded-full hover:bg-surface-alt transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {shouldShowSuggestions && (
        <ul
          ref={suggestionsRef}
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-surface rounded-lg shadow-lg 
            border border-border dark:border-border-light max-h-48 overflow-auto py-1"
          onMouseLeave={() => setSelectedIndex(-1)}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-2 cursor-pointer text-sm transition-colors
                ${index === selectedIndex 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'hover:bg-surface-alt text-text'}`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}