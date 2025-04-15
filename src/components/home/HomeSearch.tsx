"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";

interface HomeSearchProps {
  className?: string;
}

// Common subject options for quick search
const subjectOptions = [
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "biology", name: "Biology" },
  { id: "mathematics", name: "Mathematics" },
  { id: "economics", name: "Economics" }
];

export default function HomeSearch({ className = "" }: HomeSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Handle keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect '/' key press when not in an input field
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle tap on container to focus input
  useEffect(() => {
    const handleContainerClick = (e: MouseEvent) => {
      if (e.target !== inputRef.current && !isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("click", handleContainerClick);
      return () => container.removeEventListener("click", handleContainerClick);
    }
  }, [inputRef, isFocused]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      navigateToSearch(searchTerm);
    }
  };

  // Handle subject selection
  const handleSubjectClick = (subject: string) => {
    // Make sure we have a valid subject string before navigating
    if (subject && typeof subject === 'string') {
      navigateToSearch(subject);
    }
  };

  // Navigate to search page with proper query
  const navigateToSearch = (query: string) => {
    if (!query || typeof query !== 'string') {
      console.error('Invalid search query:', query);
      return;
    }
    
    setIsTransitioning(true);
    
    // Use setTimeout to allow transition animation to complete
    setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&focus=true`);
    }, 300);
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} action="/search">
        <motion.div
          ref={containerRef}
          className={`
            relative w-full flex items-center px-4 py-3.5 
            bg-white/10 hover:bg-white/15 
            backdrop-blur-md 
            rounded-xl border border-white/20
            transition-all duration-300
            ${isFocused ? "ring-2 ring-white/30 bg-white/15" : ""}
            ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Search icon */}
          <div className="flex-none mr-3">
            <svg
              className="w-5 h-5 text-white/70"
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
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={searchTerm}
            placeholder={isMobile ? "Search..." : "Search papers, subjects, units..."}
            className={`
              w-full bg-transparent text-white placeholder-white/50
              border-none outline-none text-base
              focus:ring-0
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleInputChange}
            style={{ 
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            autoComplete="off"
          />
          
          {/* Hidden focus field for form submission */}
          <input type="hidden" name="focus" value="true" />

          {/* Keyboard shortcut hint - hide on mobile */}
          {!isMobile && !isFocused && (
            <div className="flex-none ml-2 hidden sm:flex">
              <div className="flex items-center">
                <div className="px-1.5 py-0.5 rounded border border-white/20 text-white/50 text-xs">
                  /
                </div>
              </div>
            </div>
          )}
          
          {/* Submit button - visible when input has text or is focused */}
          <AnimatePresence>
            {(searchTerm || isFocused) && (
              <motion.button
                type="submit"
                className="flex-none ml-2 px-3 py-1.5 bg-primary text-white rounded-lg 
                          hover:bg-primary/90 active:scale-95 transition-all duration-150"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                Search
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      {/* Subject Options - Using direct buttons instead of Link components */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {subjectOptions.map((subject) => (
          <button
            key={subject.id}
            onClick={() => handleSubjectClick(subject.name)}
            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90
                     hover:bg-white/20 active:scale-95 transition-all duration-150"
          >
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
}