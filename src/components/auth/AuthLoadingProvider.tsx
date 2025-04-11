"use client";

import { useAuth } from "./AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
    // Auth paths
    "/auth/login",
    "/auth/register",
    // Public pages
    "/",
    "/books",
    "/notes",
    "/papers",
    "/search",
    "/exams",
    // API endpoints
    "/api/health",
    "/api/subjects",
    "/api/books",
    "/api/papers"
  ],
  loginPath = "/auth/login",
}: AuthLoadingProviderProps) {
  const { user, isLoading, refreshSession } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Check and initialize auth state
    const initializeAuth = async () => {
      if (!isInitialized) {
        try {
          await refreshSession();
        } finally {
          if (mounted) {
            setIsInitialized(true);
          }
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [isInitialized, refreshSession]);

  // Handle routing based on auth state
  // Check if a path should be public based on configured rules
  const checkPublicPath = (currentPath: string | null) => {
    if (!currentPath) return false;

    if (process.env.NODE_ENV === 'development') {
      console.log('\n==== Auth Path Check ====');
      console.log('Checking path:', currentPath);
    }

    // Handle nested paths (e.g., /papers/chemistry)
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length > 0) {
      const basePath = `/${segments[0]}`;
      const baseMatches = publicPaths.includes(basePath);
      
      if (process.env.NODE_ENV === 'development' && baseMatches) {
        console.log(`✅ Base path ${basePath} is public`);
      }
      
      if (baseMatches) return true;
    }

    // Check exact matches and path starts
    const matches = publicPaths.some(path => {
      const isMatch = currentPath === path ||
        currentPath.startsWith(path + '/') ||
        (path === '/' && currentPath === '');

      if (process.env.NODE_ENV === 'development' && isMatch) {
        console.log(`✅ Path matches rule: ${path}`);
      }

      return isMatch;
    });

    if (process.env.NODE_ENV === 'development') {
      if (!matches) {
        console.log('❌ No public path match found');
        console.log('Available public paths:', publicPaths);
      }
      console.log('=======================\n');
    }

    return matches;
  };

  // Check if a path should be treated as private
  const isPrivatePath = (currentPath: string | null) => {
    if (!currentPath) return false;

    const privatePaths = [
      '/profile',
      '/forum/new',
      '/annotate',
      '/admin'
    ];

    const isPrivate = privatePaths.some(path =>
      currentPath.startsWith(path)
    );

    if (process.env.NODE_ENV === 'development' && isPrivate) {
      console.log(`🔒 Protected path detected: ${currentPath}`);
    }

    return isPrivate;
  };

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n==== Auth State ====');
      console.log({
        path: pathname,
        isInitialized,
        isLoading,
        hasUser: !!user,
        isPublic: checkPublicPath(pathname),
        isPrivate: isPrivatePath(pathname)
      });
    }

    // Check path status and handle auth-based redirects
    const isPublic = checkPublicPath(pathname);
    const isPrivate = isPrivatePath(pathname);

    // Only redirect if path is private
    if (!user && isPrivate) {
      const returnPath = encodeURIComponent(pathname || "/");
      router.push(`${loginPath}?returnTo=${returnPath}`);
      return;
    }

    // Handle post-login redirects
    if (user && pathname === loginPath) {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      router.push(decodeURIComponent(returnTo || "/"));
    }
  }, [
    user,
    isInitialized,
    isLoading,
    pathname,
    router,
    publicPaths,
    loginPath,
  ]);

  // Show loading state while initializing auth
  if (!isInitialized || isLoading) {
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

  // Check if path requires authentication
  const requiresAuth = isPrivatePath(pathname);

  // Only block access to private paths
  if (!user && requiresAuth) {
    return null; // Will be redirected by the routing effect
  }

  return <>{children}</>;
}

export default AuthLoadingProvider;
