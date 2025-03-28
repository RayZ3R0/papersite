'use client';

import { useState } from 'react';
import { useForumUser } from '@/hooks/useForumUser';
import { TIME_WINDOWS } from '@/lib/forumUtils';

interface UserActionMenuProps {
  authorId: string;
  createdAt: string;
  onDelete: () => void;
  type: 'post' | 'reply';
}

export function UserActionMenu({ authorId, createdAt, onDelete, type }: UserActionMenuProps) {
  const { user } = useForumUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Don't show anything if not the author
  if (!user || user.id !== authorId) {
    return null;
  }

  // Check if within delete window
  const isWithinWindow = (Date.now() - new Date(createdAt).getTime()) < TIME_WINDOWS.DELETE;
  if (!isWithinWindow) {
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const endpoint = type === 'post'
        ? `/api/forum/posts/${authorId}?authorId=${user.id}`
        : `/api/forum/replies/${authorId}?authorId=${user.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to delete ${type}`);
      }

      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-2 text-sm">
      {error && (
        <div className="text-red-500 mb-2">{error}</div>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      <div className="text-text-muted text-xs mt-1">
        You can delete this {type} for {Math.floor(TIME_WINDOWS.DELETE / 60000)} minutes after posting
      </div>
    </div>
  );
}