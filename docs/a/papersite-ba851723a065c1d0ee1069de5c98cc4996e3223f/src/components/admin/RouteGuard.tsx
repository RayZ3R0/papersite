'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // No user is logged in, redirect to login
      router.replace('/auth/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      // User is logged in but not an admin, redirect to home
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  // Don't show anything while redirecting
  if (!user || user.role !== 'admin') {
    return null;
  }

  // User is admin, show the protected content
  return <>{children}</>;
}