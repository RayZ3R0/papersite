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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      navigateToSearch(searchTerm);
    }
  };

  const handleSubjectClick = (subject: string) => {
    if (subject && typeof subject === 'string') {
      navigateToSearch(subject);
    }
  };

  const navigateToSearch = (query: string) => {
    if (!query || typeof query !== 'string') {
      console.error('Invalid search query:', query);
      return;
    }
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&focus=true`);
    }, 200);
  };

  // Determine whether to show search button or keyboard hint
  const shouldShowSearchButton = isFocused || searchTerm || isMobile;
  
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
            shadow-lg shadow-black/5
            transition-all duration-200
            ${isFocused ? "ring-2 ring-white/40 bg-white/20" : ""}
            ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}
          `}
          whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}
          whileTap={{ scale: 0.99, transition: { duration: 0.1 } }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Search icon */}
          <motion.div 
            className="flex-none mr-3"
            animate={{ 
              scale: isFocused ? 1.1 : 1,
              opacity: isFocused ? 1 : 0.7,
            }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-5 h-5 text-white/80"
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
          </motion.div>

          {/* Input field with enhanced styling */}
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={searchTerm}
            placeholder={isMobile ? "Search..." : "Search papers, subjects, units..."}
            className={`
              w-full bg-transparent text-white placeholder-white/60
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
          
          <input type="hidden" name="focus" value="true" />

          {/* Right side elements container with smooth animation */}
          <div className="flex-none ml-2 relative w-16 h-10 flex items-center justify-end">
            <AnimatePresence mode="sync" initial={false}>
              {!shouldShowSearchButton && !isMobile ? (
                <motion.div
                  key="shortcut"
                  className="absolute right-0 flex items-center"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ 
                    duration: 0.15, 
                    ease: "easeInOut"
                  }}
                >
                  <div className="px-1.5 py-0.5 rounded border border-white/30 text-white/60 text-xs">
                    /
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="search-button"
                  type="submit"
                  disabled={!searchTerm}
                  className={`
                    px-3 py-1.5 bg-primary text-white rounded-lg 
                    hover:bg-primary-light active:bg-primary-dark
                    shadow-md shadow-primary/20
                    active:scale-95
                    ${!searchTerm ? 'cursor-default opacity-70' : ''}
                  `}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ 
                    duration: 0.15, 
                    ease: "easeInOut"
                  }}
                >
                  Search
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </form>

      {/* Subject Options with improved styling */}
      <motion.div 
        className="flex flex-wrap justify-center gap-3 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {subjectOptions.map((subject, index) => (
          <motion.button
            key={subject.id}
            onClick={() => handleSubjectClick(subject.name)}
            className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-white/90
                     hover:bg-white/25 active:scale-95 transition-all duration-150
                     border border-white/10 shadow-sm"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
          >
            {subject.name}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}