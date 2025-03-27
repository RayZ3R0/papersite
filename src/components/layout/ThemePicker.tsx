'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTheme, themeNames, Theme } from '@/hooks/useTheme';

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme preview colors for each theme
  const themePreviewColors: Record<Theme, string[]> = {
    'light': ['#ffffff', '#f3f4f6', '#3b82f6'],
    'dark': ['#1f2937', '#374151', '#60a5fa'],
    'catppuccin-latte': ['#eff1f5', '#e6e9ef', '#8839ef'],
    'catppuccin-frappe': ['#303446', '#414559', '#ca9ee6'],
    'catppuccin-macchiato': ['#24273a', '#363a4f', '#c6a0f6'],
    'catppuccin-mocha': ['#1e1e2e', '#313244', '#cba6f7'],
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-surface-alt focus:outline-none 
          focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
          text-text transition-colors"
        aria-label="Change theme"
      >
        <div className="w-6 h-6 rounded-md border border-border overflow-hidden grid grid-cols-2 gap-px">
          {themePreviewColors[theme].slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="w-full h-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 py-2 bg-surface border border-border 
            rounded-lg shadow-lg z-50 theme-fade-in"
        >
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-text-muted mb-2">Select Theme</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(themeNames).map(([themeKey, themeName]) => (
              <button
                key={themeKey}
                onClick={() => {
                  setTheme(themeKey as Theme);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-surface-alt
                  transition-colors text-left ${theme === themeKey ? 'text-primary' : 'text-text'}`}
              >
                {/* Theme Preview */}
                <div className="w-8 h-8 rounded-md border border-border overflow-hidden grid grid-cols-2 gap-px">
                  {themePreviewColors[themeKey as Theme].slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-full h-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Theme Name */}
                <span className="flex-1">
                  {themeName}
                  {theme === themeKey && (
                    <span className="text-xs text-text-muted ml-1">(Active)</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 pt-2 mt-2 border-t border-border">
            <p className="text-xs text-text-muted">
              Colors from{' '}
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