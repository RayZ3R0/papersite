'use client';

import { useState } from 'react';

interface AdminControlsProps {
  postId: string;
  replyId?: string;
  onDelete: () => void;
}

export function AdminControls({ postId, replyId, onDelete }: AdminControlsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Get admin token from localStorage - set this manually for now
  const adminToken = localStorage.getItem('forum_admin_token');

  if (!adminToken) {
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const endpoint = replyId
        ? `/api/forum/admin?replyId=${replyId}`
        : `/api/forum/admin?postId=${postId}`;

      const response = await fetch(endpoint, {
        method: replyId ? 'PATCH' : 'DELETE',
        headers: {
          'X-Admin-Token': adminToken
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-2">
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete as Admin'}
      </button>
    </div>
  );
}