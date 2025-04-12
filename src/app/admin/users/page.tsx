'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  verified: boolean;
  createdAt: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data.users);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Remove user from list
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-text">Loading users...</div>
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
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-text mb-6">User Management</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-hover dark:bg-surface-hover-dark">
                <th className="p-3 text-left text-text border-b border-border">Username</th>
                <th className="p-3 text-left text-text border-b border-border">Email</th>
                <th className="p-3 text-left text-text border-b border-border">Role</th>
                <th className="p-3 text-left text-text border-b border-border">Status</th>
                <th className="p-3 text-left text-text border-b border-border">Created</th>
                <th className="p-3 text-left text-text border-b border-border">Last Login</th>
                <th className="p-3 text-left text-text border-b border-border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user._id}
                  className="border-b border-border hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
                >
                  <td className="p-3 text-text">{user.username}</td>
                  <td className="p-3 text-text">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.role === 'admin' 
                        ? 'bg-primary/10 text-primary'
                        : user.role === 'moderator'
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-surface-hover dark:bg-surface-hover-dark text-text-muted'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {user.banned && (
                        <span className="px-2 py-1 bg-error/10 text-error text-sm rounded">
                          Banned
                        </span>
                      )}
                      {!user.verified && (
                        <span className="px-2 py-1 bg-warning/10 text-warning text-sm rounded">
                          Unverified
                        </span>
                      )}
                      {!user.banned && user.verified && (
                        <span className="px-2 py-1 bg-success/10 text-success text-sm rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-text-muted">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-3 text-text-muted">
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'MMM d, yyyy')
                      : 'Never'}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-error hover:text-error-dark disabled:opacity-50"
                      disabled={user.role === 'admin'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}