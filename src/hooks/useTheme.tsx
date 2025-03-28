'use client';

import * as React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 
  'light' | 
  'dark' | 
  'catppuccin-latte' | 
  'catppuccin-frappe' | 
  'catppuccin-macchiato' | 
  'catppuccin-mocha' | 
  'matcha' | 
  'nord' |
  'dracula' |
  'solarized-light' |
  'solarized-dark' |
  'rose-pine' |
  'tokyo-night' |
  'gruvbox' |
  'crimson';

export const themeNames: Record<Theme, string> = {
  'light': 'Light',
  'dark': 'Dark',
  'catppuccin-latte': 'Catppuccin Latte',
  'catppuccin-frappe': 'Catppuccin Frappé',
  'catppuccin-macchiato': 'Catppuccin Macchiato',
  'catppuccin-mocha': 'Catppuccin Mocha',
  'matcha': 'Matcha',
  'nord': 'Nord',
  'dracula': 'Dracula',
  'solarized-light': 'Solarized Light',
  'solarized-dark': 'Solarized Dark',
  'rose-pine': 'Rose Pine',
  'tokyo-night': 'Tokyo Night',
  'gruvbox': 'Gruvbox',
  'crimson': 'Crimson'
};

// Dark themes list
export const darkThemes: Theme[] = [
  'dark',
  'catppuccin-frappe',
  'catppuccin-macchiato',
  'catppuccin-mocha',
  'nord',
  'dracula',
  'solarized-dark',
  'rose-pine',
  'tokyo-night',
  'gruvbox',
  'crimson'
];


interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'papersite:theme';
const DEFAULT_THEME: Theme = 'catppuccin-mocha'; // Set default to Catppuccin Mocha

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    
    // Check for saved theme or system preference
    if (savedTheme && Object.keys(themeNames).includes(savedTheme)) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(DEFAULT_THEME); // Use Catppuccin Mocha as default dark theme
    } else {
      setTheme('catppuccin-latte'); // Use Catppuccin Latte as default light theme
    }
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Add transitioning class before changing themes
    document.documentElement.classList.add('transitioning');
    
    // Remove all theme classes
    document.documentElement.classList.remove(
      "light",
      "dark",
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
      "catppuccin-mocha",
      "matcha",
      "nord",
      "dracula",
      "solarized-light",
      "solarized-dark",
      "rose-pine",
      "tokyo-night",
      "gruvbox",
      "crimson"
    );
    
    // Add new theme class
    document.documentElement.classList.add(theme);
    
    // Also add dark/light class for base styling
    if (darkThemes.includes(theme)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }

    // Remove transitioning class after animations complete
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('transitioning');
    }, 200);

    return () => clearTimeout(timer);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if there's no saved preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(e.matches ? DEFAULT_THEME : 'catppuccin-latte');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = React.useMemo(() => ({
    theme,
    setTheme,
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility function to get CSS variable
export function getThemeColor(variableName: string): string {
  return `var(--color-${variableName})`;
}