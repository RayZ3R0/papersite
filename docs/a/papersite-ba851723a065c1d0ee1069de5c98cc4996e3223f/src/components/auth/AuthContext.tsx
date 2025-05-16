"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserWithoutPassword, AuthError } from "@/lib/authTypes";

interface AuthContextType {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: string | null;
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchAccount: (identifier: string, password: string) => Promise<void>;
  refreshSession: () => Promise<UserWithoutPassword | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Time to refresh token before expiry (5 minutes)
const REFRESH_MARGIN = 5 * 60 * 1000;

// Refresh interval (10 minutes)
const REFRESH_INTERVAL = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setUser(null);
          return null;
        }
        throw new Error(data.error || "Failed to refresh session");
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setLastRefresh(new Date());
        return data.user;
      }

      setUser(null);
      return null;
    } catch (error) {
      console.error("Session refresh error:", error);
      setUser(null);
      return null;
    }
  };

  // Enhanced session management - only initialize once
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    
    async function initializeSession() {
      setIsLoading(true);
      try {
        const userData = await refreshSession();
        if (userData) {
          // Set up periodic refresh only if we have a user
          refreshTimer = setInterval(refreshSession, REFRESH_INTERVAL);
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Initialize session once on mount
    initializeSession();

    // Cleanup timer on unmount
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []); // Only run on mount

  const handleAuthResponse = async (response: Response) => {
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Authentication failed");
    }

    const data = await response.json();
    if (!data.user) {
      throw new Error("Invalid response format");
    }

    setUser(data.user);
    setLastRefresh(new Date());
    return data.user;
  };

  const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          [identifier.includes("@") ? "email" : "username"]: identifier,
          password,
          rememberMe,
        }),
      });

      await handleAuthResponse(response);
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to login";
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      await handleAuthResponse(response);
    } catch (error) {
      console.error("Registration error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to register";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setLastRefresh(null);

      // Optionally redirect to login page
      if (pathname !== "/auth/login") {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to logout";
      setError(message);
      throw new Error(message);
    }
  };

  const switchAccount = async (identifier: string, password: string) => {
    try {
      await logout();
      await login(identifier, password, true);
    } catch (error) {
      console.error("Account switch error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to switch accounts";
      setError(message);
      throw new Error(message);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    switchAccount,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
