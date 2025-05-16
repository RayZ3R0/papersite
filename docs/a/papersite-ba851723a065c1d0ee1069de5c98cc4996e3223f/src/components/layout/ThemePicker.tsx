"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme, themeNames, Theme } from "@/hooks/useTheme";

// Get theme-specific colors without CSS variables
// Get theme-specific colors without CSS variables
const themePreviewColors: Record<Theme, string[]> = {
  light: ["#3b82f6", "#f9fafb", "#ffffff", "#1f2937"],
  dark: ["#60a5fa", "#111827", "#1f2937", "#f9fafb"],
  "catppuccin-latte": ["#8839ef", "#eff1f5", "#ffffff", "#4c4f69"],
  "catppuccin-frappe": ["#ca9ee6", "#303446", "#414559", "#c6d0f5"],
  "catppuccin-macchiato": ["#c6a0f6", "#24273a", "#363a4f", "#cad3f5"],
  "catppuccin-mocha": ["#cba6f7", "#1e1e2e", "#313244", "#cdd6f4"],
  matcha: ["#4caf50", "#f1f8e9", "#ffffff", "#2e3440"],
  nord: ["#88c0d0", "#2e3440", "#434c5e", "#eceff4"],
  gruvbox: ["#fe8019", "#282828", "#3c3836", "#ebdbb2"],
  dracula: ["#bd93f9", "#282a36", "#44475a", "#f8f8f2"],
  "solarized-light": ["#268bd2", "#fdf6e3", "#fefefe", "#073642"],
  "solarized-dark": ["#268bd2", "#002b36", "#073642", "#fdf6e3"],
  "rose-pine": ["#ebbcba", "#191724", "#26233a", "#e0def4"],
  "tokyo-night": ["#7aa2f7", "#1a1b26", "#2f3549", "#c0caf5"],
  crimson: ["#e53935", "#1a1a1a", "#2d2d2d", "#f5f5f5"],
  "one-dark": ["#61afef", "#282c34", "#3e4451", "#abb2bf"],
  everforest: ["#a3be8c", "#2b3339", "#3c3836", "#d8dee9"],
  kanagawa: ["#7fdbca", "#1f1f28", "#2a273f", "#c8d3f5"],
};

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Toggle Button with enhanced tooltip */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group p-2.5 rounded-lg hover:bg-surface-alt focus:outline-none 
          focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
          text-text transition-all duration-200 relative"
        aria-label="Change theme"
      >
        <div
          className="w-7 h-7 rounded-md border border-border overflow-hidden grid grid-cols-2 gap-px
          transition-transform duration-200 group-hover:scale-105"
        >
          {themePreviewColors[theme].map((color, i) => (
            <div
              key={i}
              className="w-full h-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {/* Enhanced Tooltip */}
        <span
          className="absolute hidden group-hover:block -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full 
          px-3 py-1.5 bg-surface text-sm text-text rounded-lg shadow-lg whitespace-nowrap z-50
          border border-border"
        >
          <span className="font-medium">Theme:</span> {themeNames[theme]}
          <span className="block text-xs text-text-muted mt-0.5">
            Click to customize
          </span>
        </span>
      </button>

      {/* Theme Dropdown - Improved mobile layout */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-64 py-2 bg-surface border border-border 
            rounded-lg shadow-lg z-50 theme-fade-in"
        >
          <div className="px-4 py-2 border-b border-border">
            <h3 className="text-sm font-medium">Select Theme</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Choose your preferred color scheme
            </p>
          </div>

          <div className="max-h-[min(420px,70vh)] overflow-y-auto py-1">
            {Object.entries(themeNames).map(([themeKey, themeName]) => (
              <button
                key={themeKey}
                onClick={() => {
                  setTheme(themeKey as Theme);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-alt
                  transition-all duration-200 text-left group
                  ${
                    theme === themeKey
                      ? "bg-surface-alt text-primary"
                      : "text-text"
                  }`}
              >
                {/* Theme Preview with hover effect */}
                <div
                  className="w-9 h-9 rounded-md border border-border overflow-hidden grid grid-cols-2 gap-px
                  transition-transform duration-200 group-hover:scale-105"
                >
                  {themePreviewColors[themeKey as Theme].map((color, i) => (
                    <div
                      key={i}
                      className="w-full h-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Theme Name with description */}
                <div className="flex-1">
                  <div className="font-medium">
                    {themeName}
                    {theme === themeKey && (
                      <span className="text-xs text-primary ml-2">
                        (Active)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {themeKey.includes("catppuccin")
                      ? "Catppuccin Theme"
                      : "Base Theme"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer with attribution */}
          <div className="px-4 pt-2 mt-1 border-t border-border">
            <p className="text-xs text-text-muted">
              Colors from{" "}
              <a
                href="https://github.com/catppuccin/catppuccin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Catppuccin
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
