'use client';

import { useAuth } from '@/components/auth/AuthContext';
import Link from 'next/link';

export const ForumHeader = () => {
  const { user } = useAuth();

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Title/Navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/forum"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Forum
            </Link>
            <nav className="hidden sm:flex space-x-6">
              <Link 
                href="/forum"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Discussions
              </Link>
              {user && (
                <Link 
                  href="/forum/new"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  New Post
                </Link>
              )}
            </nav>
          </div>

          {/* Right side - User info */}
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.username}
              </span>
              {/* We'll keep any existing user nav functionality */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ForumHeader;