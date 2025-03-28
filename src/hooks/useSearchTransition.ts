'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useSearchTransition() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobileRef = useRef(false);

  // Check if we're on mobile
  useEffect(() => {
    isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // Handle focus preservation during transition
  useEffect(() => {
    if (isTransitioning && inputRef.current) {
      // Restore focus after transition
      const input = inputRef.current;
      requestAnimationFrame(() => {
        input.focus();
        
        // Move cursor to end of input
        const length = input.value.length;
        input.setSelectionRange(length, length);
        
        setIsTransitioning(false);
      });
    }
  }, [isTransitioning]);

  // Handle mobile keyboard preservation
  useEffect(() => {
    if (isMobileRef.current && isTransitioning) {
      // Prevent mobile keyboard from dismissing
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.height = '';
        document.body.style.overflow = '';
      };
    }
  }, [isTransitioning]);

  // Handle search transition
  const handleSearch = useCallback((value: string) => {
    if (value.length === 0) return;

    setIsTransitioning(true);
    
    // Update URL with search query and focus parameter
    router.push(`/search?q=${encodeURIComponent(value)}&focus=true`, {
      scroll: false
    });
  }, [router]);

  return {
    inputRef,
    isTransitioning,
    handleSearch
  };
}