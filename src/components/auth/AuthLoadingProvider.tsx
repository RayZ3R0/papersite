"use client";

import { useAuth } from "./AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

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
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const redirectHandled = useRef(false);

  // Check if path is public
  const isPublicPath = (path: string) => {
    const normalizedPath = path.toLowerCase();
    return publicPaths.some(publicPath => 
      normalizedPath === publicPath || normalizedPath.startsWith(publicPath + '/')
    );
  };

  // Check if path requires authentication
  const isPrivatePath = (path: string) => {
    if (path.startsWith('/annotate')) return false; // annotate is public
    const privatePaths = ['/profile', '/forum/new', '/admin', '/flashcards'];
    return privatePaths.some(privatePath => path.startsWith(privatePath));
  };

  // Handle redirects after auth state is determined
  useEffect(() => {
    if (isLoading) return;

    const currentPath = pathname || "";
    const isPublic = isPublicPath(currentPath);
    const isPrivate = isPrivatePath(currentPath);

    // Prevent redirect loops
    if (redirectHandled.current) return;

    // Redirect unauthenticated users from private paths
    if (!user && isPrivate) {
      redirectHandled.current = true;
      const returnPath = encodeURIComponent(currentPath);
      router.replace(`${loginPath}?returnTo=${returnPath}`);
      return;
    }

    // Redirect authenticated users from login page
    if (user && currentPath === loginPath) {
      redirectHandled.current = true;
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      router.replace(decodeURIComponent(returnTo || "/"));
      return;
    }

    // Reset redirect flag for valid navigation
    redirectHandled.current = false;
  }, [user, isLoading, pathname, router, loginPath]);

  // Show loading spinner only during initial auth check and only for private routes
  if (isLoading) {
    const currentPath = pathname || "";
    const isPrivate = isPrivatePath(currentPath);
    
    // Don't show loading for public paths
    if (!isPrivate) {
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

  // Block unauthenticated access to private paths (will be redirected)
  const currentPath = pathname || "";
  const isPrivate = isPrivatePath(currentPath);
  
  if (!user && isPrivate) {
    return null;
  }

  return <>{children}</>;
}

export default AuthLoadingProvider;