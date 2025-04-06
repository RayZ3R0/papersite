'use client';

import ProtectedContent from '@/components/auth/ProtectedContent';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedContent 
      roles={['user', 'moderator', 'admin']}
      message="Please sign in to view your profile"
      fallback={
        <div className="container mx-auto p-4">
          <div className="bg-surface p-6 rounded-lg shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Access Required</h2>
            <p className="text-text-muted">
              Please sign in to view and manage your profile
            </p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-4">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </ProtectedContent>
  );
}