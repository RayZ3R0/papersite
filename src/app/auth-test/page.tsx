'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/AuthContext';
import ProtectedContent from '@/components/auth/ProtectedContent';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/components/auth/AuthContext';

function TestContent() {
  const { user, logout, isLoading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

      {/* Public Content */}
      <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Public Content</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This content is visible to everyone.
        </p>
      </section>

      {/* Auth Status */}
      <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : user ? (
          <div>
            <p className="text-green-600 dark:text-green-400 mb-4">
              Logged in as: <strong>{user.username}</strong> (Role: {user.role})
            </p>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Not logged in</p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        )}
      </section>

      {/* Protected Content */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
        
        <div className="space-y-4">
          {/* User-only content */}
          <ProtectedContent
            roles={['user', 'moderator', 'admin']}
            message="Please sign in to view this content"
          >
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">User Content</h3>
              <p>This content is only visible to authenticated users.</p>
            </div>
          </ProtectedContent>

          {/* Moderator-only content */}
          <ProtectedContent
            roles={['moderator', 'admin']}
            message="This content requires moderator access"
            fallback={
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-gray-500">
                  You need moderator permissions to view this content.
                </p>
              </div>
            }
          >
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">Moderator Content</h3>
              <p>This content is only visible to moderators and admins.</p>
            </div>
          </ProtectedContent>

          {/* Admin-only content */}
          <ProtectedContent
            roles={['admin']}
            message="This content requires admin access"
            fallback={
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-gray-500">
                  You need administrator permissions to view this content.
                </p>
              </div>
            }
          >
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">Admin Content</h3>
              <p>This content is only visible to administrators.</p>
            </div>
          </ProtectedContent>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}

export default function AuthTestPage() {
  return (
    <AuthProvider>
      <TestContent />
    </AuthProvider>
  );
}