import React, { useRef, KeyboardEvent } from 'react';
import { SearchQuery } from '@/types/search';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Only show suggestions if the user has typed at least 3 characters and paused
  const shouldShowSuggestions = showSuggestions && 
    value.length >= 3 && 
    suggestions.length > 0 &&
    !value.includes(' '); // Hide suggestions if user has started typing a complete query

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (shouldShowSuggestions) {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      
      case 'ArrowUp':
        if (shouldShowSuggestions) {
          e.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        }
        break;
      
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSuggestionSelect?.(suggestions[selectedIndex]);
          setShowSuggestions(false);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        break;
      
      case 'Tab':
        // Hide suggestions on Tab
        setShowSuggestions(false);
        break;

      case ' ':
        // Hide suggestions when user starts typing a complete query
        setShowSuggestions(false);
        break;
    }
  };

  const handleInputFocus = () => {
    // Only show suggestions if there's some input
    if (value.length >= 3) {
      setShowSuggestions(true);
    }
    setSelectedIndex(-1);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Hide suggestions unless clicking on a suggestion
    if (!e.relatedTarget?.closest('#search-suggestions')) {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none 
            transition-colors ${className}`}
          role="combobox"
          aria-expanded={shouldShowSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 
              rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown - Only show when typing initial term */}
      {shouldShowSuggestions && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg 
            border border-gray-200 max-h-48 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={`px-4 py-2 cursor-pointer transition-colors text-sm ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                onSuggestionSelect?.(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}