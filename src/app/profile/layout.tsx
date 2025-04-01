'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-text">Profile</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 border-b border-divider">
          <nav className="-mb-px flex space-x-8">
            <a
              href="/profile"
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${location.pathname === '/profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-divider'
                }
              `}
            >
              Personal Info
            </a>
            <a
              href="/profile/academic"
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${location.pathname === '/profile/academic'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-divider'
                }
              `}
            >
              Academic Profile
            </a>
            <a
              href="/profile/settings"
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${location.pathname === '/profile/settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-divider'
                }
              `}
            >
              Settings
            </a>
          </nav>
        </div>

        {/* Main content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}