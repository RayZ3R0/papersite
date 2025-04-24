"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Theme =
  | "light"
  | "dark"
  | "catppuccin-latte"
  | "catppuccin-frappe"
  | "catppuccin-macchiato"
  | "catppuccin-mocha"
  | "cotton-candy-dreams"
  | "matcha"
  | "nord"
  | "dracula"
  | "solarized-light"
  | "solarized-dark"
  | "rose-pine"
  | "tokyo-night"
  | "gruvbox"
  | "crimson"
  | "one-dark"
  | "kanagawa"
  | "everforest";

export const themeNames: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  "catppuccin-latte": "Catppuccin Latte",
  "catppuccin-frappe": "Catppuccin Frappé",
  "catppuccin-macchiato": "Catppuccin Macchiato",
  "catppuccin-mocha": "Catppuccin Mocha",
  matcha: "Matcha",
  "cotton-candy-dreams": "Cotton Candy",
  nord: "Nord",
  dracula: "Dracula",
  "solarized-light": "Solarized Light",
  "solarized-dark": "Solarized Dark",
  "rose-pine": "Rose Pine",
  "tokyo-night": "Tokyo Night",
  gruvbox: "Gruvbox",
  crimson: "Crimson",
  "one-dark": "One Dark",
  everforest: "Everforest",
  kanagawa: "Kanagawa",
};

// Dark themes list
export const darkThemes: Theme[] = [
  "dark",
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "catppuccin-mocha",
  "nord",
  "dracula",
  "solarized-dark",
  "rose-pine",
  "tokyo-night",
  "gruvbox",
  "crimson",
  "one-dark",
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const DEFAULT_THEME: Theme = "matcha"; // Set default to Matcha
const DB_NAME = "papersite";
const DB_VERSION = 1;
const THEME_STORE = "preferences";
const THEME_KEY = "theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Helper functions for IndexedDB
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject("IndexedDB not supported");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(THEME_STORE)) {
        db.createObjectStore(THEME_STORE);
      }
    };
  });
};

const getThemeFromDB = async (): Promise<Theme | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(THEME_STORE, "readonly");
      const store = transaction.objectStore(THEME_STORE);
      const request = store.get(THEME_KEY);

      request.onsuccess = () => {
        resolve(request.result as Theme | null);
      };

      request.onerror = () => {
        reject("Error getting theme from IndexedDB");
      };
    });
  } catch (error) {
    console.error("Failed to access IndexedDB:", error);
    return null;
  }
};

const saveThemeToDB = async (theme: Theme): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(THEME_STORE, "readwrite");
      const store = transaction.objectStore(THEME_STORE);
      const request = store.put(theme, THEME_KEY);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject("Error saving theme to IndexedDB");
      };
    });
  } catch (error) {
    console.error("Failed to save theme to IndexedDB:", error);
  }
};

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Function to set theme that also updates IndexedDB
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await saveThemeToDB(newTheme);
  };

  // Load theme from IndexedDB on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadTheme = async () => {
      try {
        // Try to get theme from IndexedDB
        const savedTheme = await getThemeFromDB();
        
        if (savedTheme && Object.keys(themeNames).includes(savedTheme)) {
          setThemeState(savedTheme);
        } else {
          // Fall back to system preference if no saved theme
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          const systemTheme = prefersDark ? DEFAULT_THEME : "catppuccin-latte";
          setThemeState(systemTheme);
          
          // Save the system preference to IndexedDB
          await saveThemeToDB(systemTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        // Fall back to default theme in case of error
        setThemeState(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;

    // Add transitioning class before changing themes
    document.documentElement.classList.add("transitioning");

    // Remove all theme classes
    document.documentElement.classList.remove(
      "light",
      "dark",
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
      "catppuccin-mocha",
      "cotton-candy-dreams",
      "matcha",
      "nord",
      "dracula",
      "solarized-light",
      "solarized-dark",
      "rose-pine",
      "tokyo-night",
      "gruvbox",
      "crimson",
      "one-dark",
      "kanagawa",
      "everforest"
    );

    // Add new theme class
    document.documentElement.classList.add(theme);

    // Also add dark/light class for base styling
    if (darkThemes.includes(theme)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }

    // Remove transitioning class after animations complete
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 200);

    return () => clearTimeout(timer);
  }, [theme, isLoading]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = async (e: MediaQueryListEvent) => {
      try {
        // Check if user has explicitly set a theme
        const savedTheme = await getThemeFromDB();
        
        // Only update if there's no saved preference
        if (!savedTheme) {
          const newTheme = e.matches ? DEFAULT_THEME : "catppuccin-latte";
          setThemeState(newTheme);
          await saveThemeToDB(newTheme);
        }
      } catch (error) {
        console.error("Error handling system theme change:", error);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* Only render children once the theme is loaded */}
      {!isLoading && children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Utility function to get CSS variable
export function getThemeColor(variableName: string): string {
  return `var(--color-${variableName})`;
}