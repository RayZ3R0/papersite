'use client';

import dynamic from 'next/dynamic';
import ProtectedContent from '@/components/auth/ProtectedContent';

// Loading component for when Dashboard is being loaded
function LoadingDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
      <div className="p-6 text-text">Loading dashboard...</div>
    </div>
  );
}

// Dynamically import the Dashboard component
const AdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => <LoadingDashboard />,
    ssr: false // Disable SSR for admin dashboard
  }
);

// Admin access denied message component
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
      <div className="p-6 max-w-sm mx-auto bg-error/10 border border-error rounded-lg text-error text-center">
        You must be an administrator to access this area.
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedContent 
      roles={['admin']}
      message="You must be an administrator to access this area"
      fallback={<AccessDenied />}
    >
      <AdminDashboard />
    </ProtectedContent>
  );
}