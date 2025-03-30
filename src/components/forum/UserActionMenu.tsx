'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { canPerformAction, ForumAction } from '@/lib/forumUtils';

interface UserActionMenuProps {
  authorId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onLock?: () => void;
  isPinned?: boolean;
  isLocked?: boolean;
  type?: 'post' | 'reply';
}

export default function UserActionMenu({
  authorId,
  onEdit,
  onDelete,
  onPin,
  onLock,
  isPinned = false,
  isLocked = false,
  type = 'post'
}: UserActionMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  // Check permissions for each action
  const canEdit = canPerformAction('edit', user, authorId, type);
  const canDelete = canPerformAction('delete', user, authorId, type);
  const canPin = type === 'post' && canPerformAction('pin', user, authorId, type);
  const canLock = type === 'post' && canPerformAction('lock', user, authorId, type);

  // Don't render if no actions are available
  if (!canEdit && !canDelete && !canPin && !canLock) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Post actions"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Edit
                </button>
              )}

              {canDelete && onDelete && (
                <button
                  onClick={() => {
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Delete
                </button>
              )}

              {canPin && onPin && (
                <button
                  onClick={() => {
                    onPin();
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  {isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}

              {canLock && onLock && (
                <button
                  onClick={() => {
                    onLock();
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-yellow-600 hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  {isLocked ? 'Unlock' : 'Lock'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}