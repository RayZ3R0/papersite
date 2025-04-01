'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

interface ReplyFormProps {
  postId: string;
  isLocked?: boolean;
  onReplyAdded?: (reply: any) => void;
}

export default function ReplyForm({ postId, isLocked, onReplyAdded }: ReplyFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      const data = await response.json();
      setContent('');
      onReplyAdded?.(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="bg-warning/10 text-warning rounded-lg p-4 text-center">
        🔒 This thread is locked. No new replies can be added.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">
          Your Reply
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-divider bg-surface px-4 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={4}
          placeholder="Write your reply..."
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reply'}
        </button>
      </div>
    </form>
  );
}