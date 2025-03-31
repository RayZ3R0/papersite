'use client';

import React, { useState, ChangeEvent } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
  initialTitle?: string;
  initialContent: string;
  type?: 'post' | 'reply';
}

export default function EditPostDialog({
  isOpen,
  onClose,
  onSubmit,
  initialTitle = '',
  initialContent,
  type = 'post'
}: EditPostDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to edit');
      }

      await onSubmit(title, content);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text">
            Edit {type === 'post' ? 'Post' : 'Reply'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {type === 'post' && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder="Post title"
                  className="w-full rounded-md border border-divider bg-surface px-4 py-2 text-text"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                required
                minLength={1}
                maxLength={type === 'post' ? 50000 : 10000}
                rows={5}
                placeholder={`Write your ${type} content here...`}
                className="w-full rounded-md border border-divider bg-surface px-4 py-2 text-text"
              />
            </div>

            {error && (
              <p className="text-error text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md border border-divider text-text hover:bg-surface-alt"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}