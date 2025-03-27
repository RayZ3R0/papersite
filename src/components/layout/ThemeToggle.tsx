'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    // Add transitioning class before theme change
    document.documentElement.classList.add('transitioning');
    
    // Toggle theme
    setTheme(theme === 'dark' ? 'light' : 'dark');
    
    // Remove transitioning class after animation
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('transitioning');
    }, 200);

    return () => clearTimeout(timer);
  }, [theme, setTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-alt focus:outline-none 
        focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        text-text transition-colors relative overflow-hidden"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {/* Sun icon */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ease-in-out transform
          ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ease-in-out transform absolute top-2 left-2
          ${theme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}