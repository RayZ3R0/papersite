"use client";

import React from "react";
import { useAuth } from "./AuthContext";
import { usePathname } from "next/navigation";
import { UserWithoutPassword } from "@/lib/authTypes";

interface ProtectedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: ("user" | "moderator" | "admin")[];
  message?: string;
  onAuthFailure?: () => void;
  render?: (user: UserWithoutPassword) => React.ReactNode;
  preventRedirect?: boolean;
  customReturnTo?: string;
}

export default function ProtectedContent({
  children,
  fallback,
  roles,
  message = "Please sign in to access this content",
  onAuthFailure,
  render,
  preventRedirect = false,
  customReturnTo,
}: ProtectedContentProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Check user authentication and roles
  const isAuthorized = user && (!roles || roles.includes(user.role));

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If not authorized
  if (!isAuthorized) {
    // Log unauthorized reason
    console.log("Not authorized because:", {
      hasUser: !!user,
      userRole: user?.role,
      requiredRoles: roles,
      roleCheckPassed: !roles || (user && roles.includes(user.role)),
    });

    // If we have a fallback, show it
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    // If we have an onAuthFailure callback, use it
    if (onAuthFailure) {
      onAuthFailure();
      return null;
    }

    // Don't redirect from admin pages (middleware handles that)
    if (pathname?.startsWith("/admin")) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
          <div className="p-6 max-w-sm mx-auto bg-error/10 border border-error rounded-lg text-error text-center">
            You must be an administrator to access this area.
            <pre className="mt-4 text-xs text-left bg-black/5 p-2 rounded">
              {JSON.stringify({ role: user?.role, required: "admin" }, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    // If preventRedirect is true, don't redirect
    if (preventRedirect) {
      return null;
    }

    // If no fallback and no callback, and we're in the browser, redirect to login
    if (typeof window !== "undefined") {
      const returnUrl = encodeURIComponent(customReturnTo || pathname || "/");
      window.location.href = `/auth/login?returnTo=${returnUrl}`;
      return null;
    }

    // If we're not in the browser or waiting for redirect, render nothing
    return null;
  }

  // If authorized and render prop is provided, use it
  if (render && user) {
    return <>{render(user)}</>;
  }

  // Otherwise, render children
  return <>{children}</>;
}

// HOC for protecting entire components
export function withProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ProtectedContentProps, "children"> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedContent {...options}>
        <WrappedComponent {...props} />
      </ProtectedContent>
    );
  };
}
