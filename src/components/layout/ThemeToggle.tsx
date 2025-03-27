'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, themeNames, Theme } from '@/hooks/useTheme';

export default function ThemeToggle() {
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (newTheme: Theme) => {
    // Add transitioning class before theme change
    document.documentElement.classList.add('transitioning');
    
    // Set new theme
    setTheme(newTheme);
    setIsOpen(false);
    
    // Remove transitioning class after animation
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('transitioning');
    }, 200);

    return () => clearTimeout(timer);
  };

  // Get current theme icon and color
  const getThemeIcon = () => {
    if (theme === 'light') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (theme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    } else {
      // Catppuccin icon (simplified cat face)
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 5c-7 0-9 6-9 6s2 6 9 6 9-6 9-6-2-6-9-6zm0 8a2 2 0 100-4 2 2 0 000 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 9l-2-2M16 9l2-2" />
        </svg>
      );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-lg hover:bg-surface-alt focus:outline-none 
          focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
          text-text transition-colors relative overflow-hidden"
        aria-label="Theme selector"
      >
        {getThemeIcon()}
      </button>

      {/* Theme dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface border border-border z-50 
          animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="py-1">
            {Object.entries(themeNames).map(([themeKey, themeName]) => (
              <button
                key={themeKey}
                onClick={() => handleThemeChange(themeKey as Theme)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  theme === themeKey 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-text hover:bg-surface-alt'
                }`}
              >
                {themeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}