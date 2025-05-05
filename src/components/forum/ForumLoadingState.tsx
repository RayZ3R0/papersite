'use client';

import { LoadingSpinner } from './LoadingSpinner';

interface ForumLoadingStateProps {
  message?: string;
  retry?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export function ForumLoadingState({
  message = 'Loading discussions...',
  retry,
  error,
  isLoading = true
}: ForumLoadingStateProps) {
  if (error) {
    return (
      <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
        <div className="text-error mb-3">{error}</div>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!isLoading) {
    return (
      <div className="text-center py-8 text-text-muted">
        No posts yet. Be the first to start a discussion!
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <LoadingSpinner />
      <p className="text-text-muted mt-2">{message}</p>
    </div>
  );
}