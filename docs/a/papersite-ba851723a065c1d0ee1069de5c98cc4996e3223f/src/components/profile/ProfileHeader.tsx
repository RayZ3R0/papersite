'use client';

import { UserWithoutPassword } from '@/lib/authTypes';

interface ProfileHeaderProps {
  user: UserWithoutPassword;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  // Add null check for user
  if (!user || !user.username) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6 bg-surface rounded-lg shadow-sm">
      {/* Avatar Section */}
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="text-3xl text-primary">
          {user.username?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>

      {/* User Info Section */}
      <div className="flex-1 text-center md:text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <h1 className="text-2xl font-bold">{user.username || 'Anonymous'}</h1>
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center md:items-start text-sm text-text-muted">
            <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            <span className="hidden md:inline">•</span>
            <span className="capitalize">{user.role || 'user'}</span>
            {user.verified && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-primary"
                  >
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}