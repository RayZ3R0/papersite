'use client';

import { forwardRef, useEffect, useState } from 'react';
import { SearchIcon } from '@/components/layout/icons';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBoxProps {
  defaultValue?: string;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  suggestions?: string[];
}

const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(({
  defaultValue = '',
  value: controlledValue,
  className = '',
  onChange,
  onClear,
  autoFocus = false,
  placeholder = "Search everything...",
  suggestions = []
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFocused, setIsFocused] = useState(false);

  // Auto focus from URL parameter or prop
  useEffect(() => {
    const shouldFocus = searchParams.get('focus') === 'true' || autoFocus;
    if (shouldFocus && ref && typeof ref === 'object' && ref.current) {
      // Small delay can help with mobile focusing
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
          // Move cursor to end
          const length = ref.current.value.length;
          ref.current.setSelectionRange(length, length);
        }
      }, 100);
    }
  }, [ref, searchParams, autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);

    // Update URL if not controlled
    if (controlledValue === undefined) {
      const params = new URLSearchParams();
      // Copy existing params
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
      
      if (newValue) {
        params.set('q', newValue);
      } else {
        params.delete('q');
        onClear?.();
      }
      router.replace(`/search?${params.toString()}`);
    }
  };

  return (
    <div 
      className={`relative touch-auto ${className}`}
      onClick={() => {
        // Focus the input when container is clicked (helpful for mobile)
        if (ref && typeof ref === 'object' && ref.current) {
          ref.current.focus();
        }
      }}
    >
      <input
        ref={ref}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-4 rounded-lg bg-surface 
                   border border-border focus:border-primary
                   text-text placeholder:text-text-muted
                   transition-colors duration-200
                   touch-auto"
        role="searchbox"
        style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0)' }}
      />
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5 text-text-muted" />
      </div>
      
      {/* Suggestions Panel */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-10">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-left text-text hover:bg-surface-alt transition-colors"
              onClick={() => {
                setInternalValue(suggestion);
                onChange?.(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;