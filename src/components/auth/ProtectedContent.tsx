'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import { UserWithoutPassword } from '@/lib/authTypes';

interface ProtectedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: ('user' | 'moderator' | 'admin')[];
  message?: string;
  onAuthFailure?: () => void;
  render?: (user: UserWithoutPassword) => React.ReactNode;
}

export default function ProtectedContent({
  children,
  fallback,
  roles,
  message = 'Please sign in to access this content',
  onAuthFailure,
  render,
}: ProtectedContentProps) {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // If not loading and no user, or user doesn't have required role
    if (!isLoading && (!user || (roles && !roles.includes(user.role)))) {
      if (onAuthFailure) {
        onAuthFailure();
      } else {
        setShowLogin(true);
      }
    }
  }, [user, isLoading, roles, onAuthFailure]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check user authentication and roles
  const isAuthorized = user && (!roles || roles.includes(user.role));

  if (!isAuthorized) {
    // Show fallback if provided
    if (fallback) {
      return (
        <>
          {fallback}
          <LoginModal
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
            message={message}
            returnTo={typeof window !== 'undefined' ? window.location.pathname : '/'}
          />
        </>
      );
    }

    // Show only login modal if no fallback
    return (
      <LoginModal
        isOpen={true}
        onClose={() => {}} // No-op since we always want to show the modal without fallback
        message={message}
        returnTo={typeof window !== 'undefined' ? window.location.pathname : '/'}
      />
    );
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
  options: Omit<ProtectedContentProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedContent {...options}>
        <WrappedComponent {...props} />
      </ProtectedContent>
    );
  };
}