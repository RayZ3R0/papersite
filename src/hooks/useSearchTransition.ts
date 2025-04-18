"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useSearchTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobileRef = useRef(false);
  const shouldFocus = searchParams.get("focus") === "true";

  // Check if we're on mobile
  useEffect(() => {
    isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // Handle auto focus when focus parameter is present
  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [shouldFocus]);

  // Handle mobile keyboard persistence
  useEffect(() => {
    if (isMobileRef.current && isTransitioning) {
      // Prevent mobile keyboard from dismissing
      document.body.style.height = "100vh";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.height = "";
        document.body.style.overflow = "";
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
    params.set("q", value);
    
    // Add focus parameter if on homepage or during any navigation
    if (pathname === "/" || pathname !== "/search") {
      params.set("focus", "true");
    }

    // Navigate to search page
    router.push(`/search?${params.toString()}`, {
      scroll: false
    });

    // Reset transition state after navigation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
  }, [router, pathname]);

  return {
    inputRef,
    isTransitioning,
    handleSearch,
    shouldFocus
  };
}
