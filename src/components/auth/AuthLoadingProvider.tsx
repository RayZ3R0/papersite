"use client";

import { useAuth } from "./AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

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
    "/annotate",
    // API endpoints
    "/api/health",
    "/api/subjects",
    "/api/books",
    "/api/papers"
  ].map(p => p.toLowerCase()),
  loginPath = "/auth/login",
}: AuthLoadingProviderProps) {
  const { user, isLoading, refreshSession } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track page transitions
  useEffect(() => {
    // Skip transition on initial load
    if (prevPathname === null) {
      setPrevPathname(pathname);
      return;
    }
    
    // Only transition when actually changing pages
    if (prevPathname !== pathname) {
      // Start transition animation
      setIsTransitioning(true);
      
      // Save current pathname
      setPrevPathname(pathname);
      
      // End transition after a short delay
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

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

    const path = currentPath.toLowerCase();

    if (process.env.NODE_ENV === 'development') {
      console.log('\n==== Auth Path Check ====');
      console.log('Checking path:', path);
    }

    // Check if path starts with any public path
    const isPublic = publicPaths.some(publicPath =>
      path === publicPath || path.startsWith(publicPath + '/')
    );

    if (process.env.NODE_ENV === 'development') {
      if (isPublic) {
        console.log(`✅ Path ${path} is public`);
      } else {
        console.log('❌ No public path match found');
        console.log('Available public paths:', publicPaths);
      }
      console.log('=======================\n');
    }

    return isPublic;
  };

  // Check if a path should be treated as private
  const isPrivatePath = (currentPath: string | null) => {
    if (!currentPath) return false;

    // Explicitly handle annotator paths
    if (currentPath.startsWith('/annotate')) {
      return false;
    }

    const privatePaths = [
      '/profile',
      '/forum/new',
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
  }, [
    user,
    isInitialized,
    isLoading,
    pathname,
    router,
    publicPaths,
    loginPath,
  ]);

  // Create wrapper with page transition effect
  const renderPageContent = () => {
    const isPublicPath = checkPublicPath(pathname);

    // Check if current path is public before showing loading state
    if (!isInitialized || isLoading) {
      if (isPublicPath) {
        return children;
      }
      
      // Only show loading for private paths
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

    return children;
  };

  return (
    <div className={`page-transition ${isTransitioning ? 'page-transitioning' : ''} ${isPending ? 'page-pending' : ''}`}>
      {renderPageContent()}
    </div>
  );
}

export default AuthLoadingProvider;