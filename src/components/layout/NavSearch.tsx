"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon } from "./icons";
import { useSearchTransition } from "@/hooks/useSearchTransition";
import { useSearchParams } from "next/navigation";

export default function NavSearch() {
  const { inputRef, isTransitioning, handleSearch } = useSearchTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [inputRef]);

  // Handle input change
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value);
    },
    [handleSearch]
  );

  // Set initial value from URL on mount and auto-focus
  useEffect(() => {
    if (initialQuery && inputRef.current) {
      inputRef.current.value = initialQuery;
      if (searchParams.get("focus") === "true") {
        inputRef.current.focus();
        setIsFocused(true);
      }
    }
  }, [initialQuery, searchParams]);

  // Handle transition effects
  useEffect(() => {
    if (isTransitioning) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isTransitioning]);

  return (
    <div
      className={`
        relative w-full transition-all duration-300 ease-in-out
        transform-gpu
        ${isTransitioning ? "opacity-50 scale-[1.02]" : "opacity-100 scale-100"}
      `}
      ref={containerRef}
    >
      <div
        className={`
          relative transition-all duration-200 ease-in-out transform
          bg-surface-alt border border-border/50 rounded-lg overflow-hidden 
          ${
            isFocused
              ? "border-border shadow-sm ring-1 ring-border/50 bg-surface scale-[1.02]"
              : "hover:border-border/80 hover:bg-surface-hover/50 hover:scale-[1.01]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          placeholder="Search papers, books, and notes..."
          defaultValue={initialQuery}
          className={`
            w-full bg-transparent px-9 h-9
            text-sm text-text placeholder:text-text-muted/70
            focus:outline-none focus:ring-0
            transition-colors duration-200
            ${isTransitioning ? "cursor-progress" : ""}
          `}
          style={{
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={onInputChange}
          disabled={isTransitioning}
        />

        {/* Search Icon and Loading Indicator */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <SearchIcon
            className={`w-4 h-4 transition-all duration-200
              ${isFocused ? "text-text" : "text-text-muted/70"}
              ${isTransitioning ? "animate-pulse" : ""}`}
          />
        </div>

        {/* Keyboard Shortcut Hint */}
        {!isTransitioning && !isFocused && (
          <div className="absolute inset-y-0 right-2.5 hidden md:flex items-center pointer-events-none">
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border/50 text-text-muted/70 bg-surface-hover">
              {navigator.platform.toLowerCase().includes("mac")
                ? "⌘K"
                : "Ctrl K"}
            </kbd>
          </div>
        )}
      </div>
    </div>
  );
}
