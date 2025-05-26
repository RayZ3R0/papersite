"use client";

import { useAuth } from "./AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition, useRef } from "react";

interface AuthLoadingProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  publicPaths?: string[];
  loginPath?: string;
}

export function AuthLoadingProvider({
  children,
  fallback = null,
  publicPaths = [
    "/auth/login",
    "/auth/register",
    "/",
    "/books",
    "/notes",
    "/papers",
    "/search",
    "/exams",
    "/annotate",
    "/api/health",
    "/api/subjects",
    "/api/books",
    "/api/papers"
  ].map(p => p.toLowerCase()),
  loginPath = "/auth/login",
}: AuthLoadingProviderProps) {
  const { user, isLoading, refreshSession } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initializationRef = useRef(false);

  // Check if a path should be public
  const checkPublicPath = (currentPath: string | null) => {
    if (!currentPath) return false;
    const path = currentPath.toLowerCase();
    return publicPaths.some(publicPath =>
      path === publicPath || path.startsWith(publicPath + '/')
    );
  };

  const isPrivatePath = (currentPath: string | null) => {
    if (!currentPath) return false;
    if (currentPath.startsWith('/annotate')) return false;

    const privatePaths = ['/profile', '/forum/new', '/admin', '/flashcards'];
    return privatePaths.some(path => currentPath.startsWith(path));
  };

  // Initialize auth state only once
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (initializationRef.current || isInitialized) return;
      
      initializationRef.current = true;
      
      try {
        await refreshSession();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setHasInitiallyLoaded(true);
        }
      }
    };

    // Only initialize once when component first mounts
    if (!hasInitiallyLoaded) {
      initializeAuth();
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  // Handle redirects based on auth state
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    const isPublic = checkPublicPath(pathname);
    const isPrivate = isPrivatePath(pathname);

    // Only redirect if path is private and user is not authenticated
    if (!user && isPrivate) {
      startTransition(() => {
        const returnPath = encodeURIComponent(pathname || "/");
        router.push(`${loginPath}?returnTo=${returnPath}`);
      });
      return;
    }

    // Handle post-login redirects
    if (user && pathname === loginPath) {
      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get("returnTo");
        router.push(decodeURIComponent(returnTo || "/"));
      });
    }
  }, [user, isInitialized, isLoading, pathname, router, loginPath]);

  // Show loading only for private paths and only during initial load
  const isPublicPath = checkPublicPath(pathname);
  const isPrivate = isPrivatePath(pathname);

  if (!hasInitiallyLoaded || (!isInitialized && isPrivate)) {
    if (isPublicPath) {
      return <>{children}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        {fallback || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  // Block access to private paths for unauthenticated users
  if (!user && isPrivate && !isLoading) {
    return null; // Will be redirected by the routing effect
  }

  return <>{children}</>;
}

export default AuthLoadingProvider;