'use client';

import { useCallback, useEffect, useState } from 'react';
import { SearchIcon } from '@/components/layout/icons';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSearchTransition } from '@/hooks/useSearchTransition';

interface HomeSearchProps {
  className?: string;
}

export default function HomeSearch({ className = '' }: HomeSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { inputRef, isTransitioning, handleSearch } = useSearchTransition();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputRef]);

  // Handle input change
  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  }, [handleSearch]);

  return (
    <div 
      className={`
        relative w-full max-w-2xl mx-auto transition-all duration-200
        ${isFocused ? 'scale-[1.02]' : 'scale-100'}
        ${isTransitioning ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
    >
      <div 
        className={`
          relative backdrop-blur-lg transition-all duration-200
          ${isFocused 
            ? 'bg-white/15 shadow-lg' 
            : 'bg-white/10 shadow'
          }
          rounded-xl border border-white/20
          ${isFocused ? 'border-white/30' : 'border-white/20'}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search papers, books, and notes..."
          className={`
            w-full bg-transparent px-12 h-14
            text-white placeholder-white/60
            focus:outline-none focus:ring-0
            transition-all duration-200
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={onInputChange}
          disabled={isTransitioning}
        />
        
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className={`w-5 h-5 text-white/70 transition-opacity duration-200
            ${isTransitioning ? 'opacity-50' : 'opacity-100'}`} 
          />
        </div>

        {/* Keyboard Shortcut Hint */}
        {!isMobile && !isFocused && !isTransitioning && (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <span className="text-sm text-white/50">
              {navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl K'}
            </span>
          </div>
        )}
      </div>

      {/* Focus Ring Animation */}
      <div 
        className={`
          absolute -inset-px rounded-xl transition-all duration-300
          ${isFocused 
            ? 'bg-white/20 blur-lg opacity-100' 
            : 'blur-md opacity-0'
          }
        `} 
        aria-hidden="true"
      />
    </div>
  );
}