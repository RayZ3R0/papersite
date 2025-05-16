'use client';

import { forwardRef, useState } from 'react';
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

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative rounded-lg border border-border
        bg-surface overflow-hidden
        transition-all duration-200
        ${isFocused ? 'border-primary' : 'hover:border-border-light'}
      `}>
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-12 pl-12 pr-4 
                    bg-transparent
                    text-text placeholder:text-text-muted
                    focus:outline-none focus:ring-0
                    transition-colors duration-200"
        />
        
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-text-muted" />
        </div>
      </div>
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;