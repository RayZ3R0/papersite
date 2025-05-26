"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserWithoutPassword } from "@/lib/authTypes";

interface AuthContextType {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchAccount: (identifier: string, password: string) => Promise<void>;
  refreshSession: () => Promise<UserWithoutPassword | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Single refresh promise to prevent duplicate requests
let refreshPromise: Promise<UserWithoutPassword | null> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const initRef = useRef(false);

  const refreshSession = async (): Promise<UserWithoutPassword | null> => {
    // Deduplicate refresh requests
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Cache-Control": "no-cache" }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null);
            return null;
          }
          throw new Error("Failed to refresh session");
        }

        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          return data.user;
        }

        setUser(null);
        return null;
      } catch (error) {
        console.error("Session refresh error:", error);
        setUser(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  // Initialize auth state only once
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Simple token refresh timer - only check every 5 minutes
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      // Only refresh if user is logged in and tab is visible
      if (user && document.visibilityState === "visible") {
        refreshSession();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, isInitialized]);

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
    return data.user;
  };

  const login = async (identifier: string, password: string, rememberMe: boolean = false) => {
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
      const message = error instanceof Error ? error.message : "Failed to login";
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (username: string, email: string, password: string) => {
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
      const message = error instanceof Error ? error.message : "Failed to register";
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
      router.push("/auth/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to logout";
      setError(message);
      throw new Error(message);
    }
  };

  const switchAccount = async (identifier: string, password: string) => {
    try {
      await logout();
      await login(identifier, password, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to switch accounts";
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