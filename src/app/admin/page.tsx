'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedContent from '@/components/auth/ProtectedContent';

interface AdminStats {
  totalUsers: number;
  unverifiedUsers: number;
  bannedUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      // Calculate stats from users data
      const stats = {
        totalUsers: data.data.users.length,
        unverifiedUsers: data.data.users.filter((u: any) => !u.verified).length,
        bannedUsers: data.data.users.filter((u: any) => u.banned).length,
      };

      setStats(stats);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const Dashboard = () => {
    if (isLoading) {
      return (
        <div className="p-6">
          <div className="text-text">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="p-4 bg-error/10 border border-error rounded text-error">
            {error}
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-surface dark:bg-surface-dark rounded-lg border border-border">
            <div className="text-3xl font-bold text-primary mb-2">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-text-muted">Total Users</div>
          </div>

          <div className="p-6 bg-surface dark:bg-surface-dark rounded-lg border border-border">
            <div className="text-3xl font-bold text-warning mb-2">
              {stats?.unverifiedUsers || 0}
            </div>
            <div className="text-text-muted">Unverified Users</div>
          </div>

          <div className="p-6 bg-surface dark:bg-surface-dark rounded-lg border border-border">
            <div className="text-3xl font-bold text-error mb-2">
              {stats?.bannedUsers || 0}
            </div>
            <div className="text-text-muted">Banned Users</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-surface hover:bg-surface-hover dark:bg-surface-dark dark:hover:bg-surface-hover-dark rounded-lg border border-border group"
            >
              <h3 className="font-medium text-text group-hover:text-primary">
                Manage Users
              </h3>
              <p className="text-sm text-text-muted mt-1">
                View, delete, or modify user accounts
              </p>
            </Link>

            {/* Add more quick action cards as we add features */}
            <div className="p-4 bg-surface dark:bg-surface-dark rounded-lg border border-border opacity-50 cursor-not-allowed">
              <h3 className="font-medium text-text">Manage Subjects</h3>
              <p className="text-sm text-text-muted mt-1">
                Coming soon - Configure subjects and units
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedContent 
      roles={['admin']}
      message="You must be an administrator to access this area"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
          <div className="p-6 max-w-sm mx-auto bg-error/10 border border-error rounded-lg text-error text-center">
            You must be an administrator to access this area.
          </div>
        </div>
      }
    >
      <Dashboard />
    </ProtectedContent>
  );
}