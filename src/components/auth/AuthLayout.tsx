'use client';

import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/components/auth/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout>
          {children}
        </MainLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}