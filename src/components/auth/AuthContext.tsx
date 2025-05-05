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

// Session configuration
const SECURITY_CONFIG = {
  session: {
    // Refresh 5 minutes before expiry
    renewalThreshold: 5 * 60 * 1000,
    // Check every minute
    checkInterval: 60 * 1000,
    // Max retries for refresh
    maxRetries: 3,
    // Backoff settings
    backoff: {
      initialDelay: 1000,
      maxDelay: 30000,
      factor: 2
    }
  }
};

// Request deduplication
let refreshPromise: Promise<UserWithoutPassword | null> | null = null;
let lastRefreshTime = 0;
let refreshRetries = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Function to refresh the session
  const backoff = (attempt: number) => {
    const { initialDelay, maxDelay, factor } = SECURITY_CONFIG.session.backoff;
    const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);
    return new Promise(resolve => setTimeout(resolve, delay));
  };

  const refreshSession = async () => {
    const now = Date.now();
    const sessionId = Math.random().toString(36).slice(2);
    
    console.debug(`[Auth ${sessionId}] Refresh attempt:`, {
      timeSinceLastRefresh: now - lastRefreshTime,
      hasExistingPromise: !!refreshPromise,
      retryCount: refreshRetries
    });
    
    // Deduplicate requests within 1 second window
    if (now - lastRefreshTime < 1000 && refreshPromise) {
      console.debug(`[Auth ${sessionId}] Using existing refresh promise`);
      return refreshPromise;
    }

    // Reset retries if it's been more than 1 minute since last attempt
    if (now - lastRefreshTime > 60000) {
      refreshRetries = 0;
    }

    try {
      // Create new refresh promise
      refreshPromise = (async () => {
        for (let attempt = 0; attempt <= refreshRetries; attempt++) {
          try {
            console.debug(`[Auth ${sessionId}] Making refresh request:`, {
              attempt: attempt + 1,
              backoffDelay: attempt > 0 ? SECURITY_CONFIG.session.backoff.initialDelay * Math.pow(SECURITY_CONFIG.session.backoff.factor, attempt) : 0
            });
            
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
            console.debug(`[Auth ${sessionId}] Refresh response:`, {
              status: response.status,
              hasUser: !!data.user
            });
            
            if (data.user) {
              setUser(data.user);
              setLastRefresh(new Date());
              refreshRetries = 0; // Reset retries on success
              return data.user;
            }

            setUser(null);
            return null;

          } catch (error) {
            if (attempt < SECURITY_CONFIG.session.maxRetries) {
              console.warn(`Refresh attempt ${attempt + 1} failed, retrying...`);
              await backoff(attempt);
              continue;
            }
            throw error;
          }
        }
        throw new Error("Max refresh retries exceeded");
      })();

      lastRefreshTime = now;
      return await refreshPromise;

    } catch (error) {
      console.error("Session refresh error:", error);
      refreshRetries++;
      setUser(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  };

  // Enhanced session management with token expiry prediction
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    let mounted = true;
    
    async function initializeSession() {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        const userData = await refreshSession();
        if (userData && mounted) {
          // Start periodic checks for token expiry
          refreshTimer = setInterval(() => {
            const tokenData = document.cookie
              .split('; ')
              .find(row => row.startsWith('auth-token='));
              
            if (tokenData) {
              const token = tokenData.split('=')[1];
              try {
                // Extract expiry from token without full verification
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = payload.exp * 1000;
                const timeUntilExpiry = expiryTime - Date.now();
                const shouldRefresh = timeUntilExpiry <= SECURITY_CONFIG.session.renewalThreshold;
                
                console.debug('Token status check:', {
                  timeUntilExpiry: Math.floor(timeUntilExpiry / 1000),
                  shouldRefresh,
                  tokenId: payload.jti
                });
                
                // Refresh if within renewal threshold
                if (shouldRefresh) {
                  refreshSession();
                }
              } catch (e) {
                // Token is invalid/malformed - trigger refresh
                refreshSession();
              }
            }
          }, SECURITY_CONFIG.session.checkInterval);
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      mounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

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
