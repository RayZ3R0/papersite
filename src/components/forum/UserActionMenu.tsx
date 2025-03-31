'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { canPerformAction } from '@/lib/forumUtils';

interface UserActionMenuProps {
  authorId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onLock?: () => void;
  isPinned?: boolean;
  isLocked?: boolean;
  type: 'post' | 'reply';
}

export default function UserActionMenu({
  authorId,
  onEdit,
  onDelete,
  onPin,
  onLock,
  isPinned,
  isLocked,
  type
}: UserActionMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const canEdit = canPerformAction('edit', user, authorId, type);
  const canDelete = canPerformAction('delete', user, authorId, type);
  const canPin = canPerformAction('pin', user, authorId, type);
  const canLock = canPerformAction('lock', user, authorId, type);

  // Don't render if user has no permissions
  if (!canEdit && !canDelete && !canPin && !canLock) {
    return null;
  }

  const handleAction = async (action: () => void | Promise<void>) => {
    try {
      setError('');
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="relative">
      {/* Action button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-surface-alt transition-colors"
        aria-label="Post actions"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-5 h-5 text-text-muted" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-divider z-50">
          <div className="py-1">
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  handleAction(onEdit);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-text hover:bg-surface-alt"
              >
                Edit
              </button>
            )}

            {canDelete && onDelete && (
              <button
                onClick={() => {
                  const confirm = window.confirm('Are you sure you want to delete this?');
                  if (confirm) {
                    handleAction(onDelete);
                  }
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-error hover:bg-surface-alt"
              >
                Delete
              </button>
            )}

            {canPin && onPin && (
              <button
                onClick={() => {
                  handleAction(onPin);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-text hover:bg-surface-alt"
              >
                {isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}

            {canLock && onLock && (
              <button
                onClick={() => {
                  handleAction(onLock);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-text hover:bg-surface-alt"
              >
                {isLocked ? 'Unlock' : 'Lock'}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-48 p-2 bg-error text-white text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}