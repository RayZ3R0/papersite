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
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  switchAccount: (identifier: string, password: string) => Promise<void>;
  refreshSession: () => Promise<UserWithoutPassword | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Detect connection type and adjust settings accordingly
const getConnectionType = (): "fast" | "medium" | "slow" => {
  if (typeof navigator === "undefined" || !("connection" in navigator)) {
    return "medium"; // Default for browsers without Network Information API
  }

  const conn = (navigator as any).connection;

  if (conn.saveData) {
    return "slow"; // Respect data-saving mode
  }

  if (conn.effectiveType === "4g") {
    return "fast";
  } else if (conn.effectiveType === "3g") {
    return "medium";
  } else {
    return "slow"; // 2g or slow-2g
  }
};

// Adaptive session configuration based on connection speed
const getSecurityConfig = () => {
  const connectionType = getConnectionType();

  const configs = {
    fast: {
      renewalThreshold: 5 * 60 * 1000, // 5 minutes before expiry
      checkInterval: 60 * 1000, // Check every minute
      maxRetries: 3,
      backoff: {
        initialDelay: 1000,
        maxDelay: 30000,
        factor: 2,
      },
    },
    medium: {
      renewalThreshold: 10 * 60 * 1000, // 10 minutes before expiry
      checkInterval: 2 * 60 * 1000, // Check every 2 minutes
      maxRetries: 2,
      backoff: {
        initialDelay: 2000,
        maxDelay: 30000,
        factor: 2,
      },
    },
    slow: {
      renewalThreshold: 20 * 60 * 1000, // 20 minutes before expiry
      checkInterval: 5 * 60 * 1000, // Check every 5 minutes
      maxRetries: 1,
      backoff: {
        initialDelay: 3000,
        maxDelay: 30000,
        factor: 1.5,
      },
    },
  };

  return configs[connectionType];
};

// Initialize with medium settings, will be updated at runtime
let SECURITY_CONFIG = {
  session: {
    renewalThreshold: 10 * 60 * 1000,
    checkInterval: 2 * 60 * 1000,
    maxRetries: 2,
    backoff: {
      initialDelay: 2000,
      maxDelay: 30000,
      factor: 2,
    },
  },
};

// Request deduplication
let refreshPromise: Promise<UserWithoutPassword | null> | null = null;
let lastRefreshTime = 0;
let refreshRetries = 0;
let sessionInitialized = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Update config based on connection type
  useEffect(() => {
    // Update security config based on connection
    SECURITY_CONFIG.session = getSecurityConfig();

    // Listen for connection changes to update config (if browser supports it)
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as any).connection;
      const updateConfig = () => {
        SECURITY_CONFIG.session = getSecurityConfig();
        // Log configuration change for debugging
        console.debug("Connection changed, updated auth config:", {
          type: conn.effectiveType,
          saveData: conn.saveData,
        });
      };

      conn.addEventListener("change", updateConfig);
      return () => conn.removeEventListener("change", updateConfig);
    }
  }, []);

  // Function to refresh the session with adaptive backoff
  const backoff = (attempt: number) => {
    const { initialDelay, maxDelay, factor } = SECURITY_CONFIG.session.backoff;
    const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  const refreshSession = async () => {
    const now = Date.now();
    const sessionId = Math.random().toString(36).slice(2);

    // Extended deduplication window for slow connections
    const deduplicationWindow = getConnectionType() === "slow" ? 5000 : 1000;

    // Enhanced deduplication logic with longer window for slow connections
    if (now - lastRefreshTime < deduplicationWindow && refreshPromise) {
      return refreshPromise;
    }

    // Reset retries if it's been more than 2 minutes since last attempt
    if (now - lastRefreshTime > 120000) {
      refreshRetries = 0;
    }

    try {
      // Create new refresh promise with optimized logic
      refreshPromise = (async () => {
        for (let attempt = 0; attempt <= refreshRetries; attempt++) {
          try {
            // Only log in development to reduce client-side processing
            if (process.env.NODE_ENV === "development") {
              console.debug(`[Auth ${sessionId}] Making refresh request:`, {
                attempt: attempt + 1,
              });
            }

            const response = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
              // Add priority hint for background requests
              headers: {
                Priority: "low",
              },
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
              refreshRetries = 0; // Reset retries on success
              return data.user;
            }

            setUser(null);
            return null;
          } catch (error) {
            if (attempt < SECURITY_CONFIG.session.maxRetries) {
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
      if (process.env.NODE_ENV === "development") {
        console.error("Session refresh error:", error);
      }
      refreshRetries++;
      setUser(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  };

  // Enhanced session management with token expiry prediction and connection awareness
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    let mounted = true;

    async function initializeSession() {
      if (!mounted || sessionInitialized) return;

      setIsLoading(true);
      try {
        // Only do full token validation on initial page load
        const userData = await refreshSession();

        if (userData && mounted) {
          sessionInitialized = true;

          // Use requestIdleCallback for non-critical operations if available
          const scheduleTokenCheck =
            typeof window !== "undefined" && "requestIdleCallback" in window
              ? (window as any).requestIdleCallback
              : setTimeout;

          // Implement more efficient token checking
          refreshTimer = setInterval(() => {
            scheduleTokenCheck(
              () => {
                // Only check token when tab is visible to save resources
                if (document.visibilityState !== "visible") return;

                const tokenData = document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("auth-token="));

                if (tokenData) {
                  const token = tokenData.split("=")[1];
                  try {
                    // Only parse the expiry time without unnecessary logging
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const expiryTime = payload.exp * 1000;
                    const timeUntilExpiry = expiryTime - Date.now();

                    // Only refresh if within the dynamic threshold based on connection speed
                    if (
                      timeUntilExpiry <=
                      SECURITY_CONFIG.session.renewalThreshold
                    ) {
                      refreshSession();
                    }
                  } catch (e) {
                    // Silent failure with fallback refresh
                    refreshSession();
                  }
                }
              },
              { timeout: 2000 },
            );
          }, SECURITY_CONFIG.session.checkInterval);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Session initialization error:", error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Only initialize if document is visible to save resources on background tabs
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
    ) {
      initializeSession();
    }

    // Add visibility change listener to initialize session when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !sessionInitialized) {
        initializeSession();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      mounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
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
    sessionInitialized = true;
    return data.user;
  };

  const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean = false,
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
      const message =
        error instanceof Error ? error.message : "Failed to login";
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
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
      sessionInitialized = false;

      if (pathname !== "/auth/login") {
        router.push("/auth/login");
      }
    } catch (error) {
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
