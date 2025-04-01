'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Paper Site</h2>
          <p className="mt-2 text-text-muted">Your Academic Resource Hub</p>
        </div>

        {/* Auth content */}
        <div className="bg-surface rounded-lg shadow-lg p-8 space-y-6 border border-divider">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-text-muted">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}