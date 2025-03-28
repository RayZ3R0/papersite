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

  // Handle mobile keyboard persistence
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
    
    // Create URL with search query
    const params = new URLSearchParams();
    
    // Set search query
    params.set('q', value);
    
    // Only add focus parameter if transitioning from homepage
    if (window.location.pathname === '/') {
      params.set('focus', 'true');
    }

    // Navigate to search page
    router.push(`/search?${params.toString()}`, {
      scroll: false
    });
  }, [router]);

  return {
    inputRef,
    isTransitioning,
    handleSearch
  };
}