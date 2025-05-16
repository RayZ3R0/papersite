"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { SearchIcon } from "@/components/layout/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSearchTransition } from "@/hooks/useSearchTransition";

interface HomeSearchProps {
  className?: string;
}

export default function HomeSearch({ className = "" }: HomeSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { inputRef, isTransitioning, handleSearch } = useSearchTransition();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Handle tap on container to focus input
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTap = () => {
      if (inputRef.current && !isFocused) {
        inputRef.current.focus();
      }
    };

    container.addEventListener("click", handleTap);
    return () => container.removeEventListener("click", handleTap);
  }, [inputRef, isFocused]);

  // Handle input change
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value);
    },
    [handleSearch]
  );

  return (
    <div
      className={`
        relative w-full transition-all duration-200
        ${isFocused ? "scale-[1.02]" : "scale-100"}
        ${isTransitioning ? "opacity-50" : "opacity-100"}
        md:max-w-2xl md:mx-auto px-4 md:px-0
        ${className}
      `}
    >
      <div
        ref={containerRef}
        className={`
          relative backdrop-blur-lg transition-all duration-200 cursor-text
          ${
            isFocused
              ? "bg-white/15 shadow-lg"
              : "bg-white/10 shadow hover:bg-white/12"
          }
          rounded-xl border border-white/20
          ${isFocused ? "border-white/30" : "border-white/20"}
          overflow-hidden
        `}
      >
        {/* Input field - Using a button to trigger focus on mobile */}
        {isMobile && !isFocused && (
          <button
            aria-label="Tap to search"
            className="absolute inset-0 z-10 w-full h-full"
            onClick={() => {
              inputRef.current?.focus();
            }}
          />
        )}

        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          placeholder="Search past papers..."
          className={`
            w-full bg-transparent px-12 h-14
            text-white placeholder-white/60
            focus:outline-none focus:ring-0
            transition-all duration-200
          `}
          style={{
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            fontSize: isMobile ? "16px" : "inherit",
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={onInputChange}
          disabled={isTransitioning}
        />

        {/* Search Icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon
            className={`w-5 h-5 text-white/70 transition-opacity duration-200
            ${isTransitioning ? "opacity-50" : "opacity-100"}`}
          />
        </div>

        {/* Keyboard Shortcut Hint - Only on Desktop */}
        {!isMobile && !isFocused && !isTransitioning && (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <span className="text-sm text-white/50">
              {navigator.platform.toLowerCase().includes("mac")
                ? "⌘K"
                : "Ctrl K"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
