'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';

interface AdminControlsProps {
  onPinPost?: () => void;
  onLockPost?: () => void;
  onDeletePost?: () => void;
  isPinned?: boolean;
  isLocked?: boolean;
  className?: string;
}

export default function AdminControls({
  onPinPost,
  onLockPost,
  onDeletePost,
  isPinned = false,
  isLocked = false,
  className = '',
}: AdminControlsProps) {
  const { user } = useAuth();

  // Only show controls for admin and moderators
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {onPinPost && (
        <button
          onClick={onPinPost}
          className="px-3 py-1 text-sm rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300"
          title={isPinned ? 'Unpin post' : 'Pin post'}
        >
          {isPinned ? 'Unpin' : 'Pin'}
        </button>
      )}
      
      {onLockPost && (
        <button
          onClick={onLockPost}
          className="px-3 py-1 text-sm rounded-md bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
          title={isLocked ? 'Unlock post' : 'Lock post'}
        >
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
      )}
      
      {/* Delete button - Only shown to admins */}
      {onDeletePost && user.role === 'admin' && (
        <button
          onClick={onDeletePost}
          className="px-3 py-1 text-sm rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
          title="Delete post"
        >
          Delete
        </button>
      )}
    </div>
  );
}