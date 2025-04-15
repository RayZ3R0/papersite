'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { SearchIcon } from '@/components/layout/icons';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBoxProps {
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(({
  value = '',
  className = '',
  onChange,
  onClear,
  placeholder = "Search everything..."
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Fix: Properly handle forwarded ref without directly assigning to current
  useEffect(() => {
    if (inputRef.current) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      }
    }
  }, [ref]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);

    // If we're on the search page, update URL
    if (window.location.pathname === '/search') {
      // Create new URLSearchParams and copy existing params
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== 'q') { // Keep all except query
          params.set(key, value);
        }
      });

      if (newValue) {
        params.set('q', newValue);
      } else {
        onClear?.();
      }
      router.replace(`/search?${params.toString()}`);
    }
  };
  
  const handleClear = () => {
    onClear?.();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative rounded-lg border border-border
        bg-surface overflow-hidden
        transition-all duration-200
        ${isFocused ? 'border-primary shadow-sm' : 'hover:border-border-light'}
      `}>
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-12 pl-12 pr-10 
                    bg-transparent
                    text-text placeholder:text-text-muted
                    focus:outline-none focus:ring-0
                    transition-colors duration-200"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
        
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-text-muted" />
        </div>
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center justify-center
                      w-8 h-8 my-auto rounded-full
                      text-text-muted hover:text-text 
                      hover:bg-surface-alt/80 active:scale-95
                      transition-all duration-150"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;