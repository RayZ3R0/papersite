'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import UserActionMenu from './UserActionMenu';
import EditPostDialog from './EditPostDialog';
import { formatDate, canPerformAction } from '@/lib/forumUtils';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { performance as perfLogger } from '@/lib/errorUtils';

interface PostContentProps {
  post: {
    _id: string;
    title: string;
    content: string;
    author: string;
    username: string;
    createdAt: string | Date;
    edited: boolean;
    editedAt?: string | Date;
    isPinned?: boolean;
    isLocked?: boolean;
    userInfo?: {
      role: string;
      verified: boolean;
    };
  };
  onEdit?: (title: string, content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onPin?: () => Promise<void>;
  onLock?: () => Promise<void>;
}

export default function PostContent({
  post,
  onEdit,
  onDelete,
  onPin,
  onLock
}: PostContentProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const contentLength = post.content.length;
  const isLongContent = contentLength > 500;
  const displayContent = isLongContent && !isExpanded 
    ? post.content.slice(0, 500) + '...' 
    : post.content;

  const handleEdit = useCallback(async (title: string, content: string) => {
    const startTime = window.performance.now();
    setIsRetrying(true);
    try {
      if (!onEdit) return;
      await onEdit(title, content);
      perfLogger.trackPostLoad(window.performance.now() - startTime, true);
      setError('');
    } catch (err) {
      perfLogger.trackPostLoad(window.performance.now() - startTime, false);
      perfLogger.trackClientError(
        err instanceof Error ? err : new Error('Failed to edit post'),
        { component: 'PostContent', action: 'edit', postId: post._id }
      );
      setError(err instanceof Error ? err.message : 'Failed to edit post');
    } finally {
      setIsRetrying(false);
    }
  }, [onEdit, post._id]);

  const PostContent = (
    <article
      className="bg-surface rounded-lg shadow-sm border border-divider overflow-hidden"
      aria-labelledby={`post-title-${post._id}`}
    >
      <div className="divide-y divide-divider">
        {/* Header */}
        <header className="px-6 py-4 bg-surface-alt/30">
          {/* Title and Action Menu */}
          <div className="flex justify-between items-start mb-2.5">
            <h2 
              id={`post-title-${post._id}`}
              className="text-xl font-semibold text-text break-words pr-4 flex items-center gap-2"
            >
              {post.isPinned && (
                <span className="text-primary flex-shrink-0" title="Pinned post" aria-label="Pinned post">
                  📌
                </span>
              )}
              <span>{post.title}</span>
            </h2>
            <div className="flex-shrink-0 -mt-1 -mr-2">
              <UserActionMenu
                authorId={post.author}
                onEdit={() => setIsEditOpen(true)}
                onDelete={onDelete}
                onPin={onPin}
                onLock={onLock}
                isPinned={post.isPinned}
                isLocked={post.isLocked}
                type="post"
              />
            </div>
          </div>

          {/* Author info and metadata */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-text">
                {post.username}
                {post.userInfo?.verified && (
                  <span className="ml-0.5 text-primary" title="Verified user" aria-label="Verified user">
                    ✓
                  </span>
                )}
              </span>
              {post.userInfo?.role !== 'user' && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-surface-alt text-text-muted">
                  {post.userInfo?.role}
                </span>
              )}
              <span className="text-text-muted" aria-hidden="true">•</span>
              <time 
                dateTime={new Date(post.createdAt).toISOString()} 
                className="text-text-muted"
              >
                {formatDate(post.createdAt)}
              </time>
              {post.edited && (
                <>
                  <span className="text-text-muted" aria-hidden="true">•</span>
                  <time
                    dateTime={post.editedAt ? new Date(post.editedAt).toISOString() : undefined}
                    className="text-text-muted"
                    title={post.editedAt ? formatDate(post.editedAt) : undefined}
                  >
                    edited
                  </time>
                </>
              )}
            </div>
          </div>
          
          {post.isLocked && (
            <div className="mt-2 text-sm text-warning flex items-center gap-1.5" role="alert">
              <span aria-hidden="true">🔒</span>
              <span>This post has been locked</span>
            </div>
          )}

          {error && (
            <div className="mt-2 text-sm text-error" role="alert">
              {error}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="prose prose-text max-w-none break-words whitespace-pre-wrap">
            {displayContent.split('\n').map((paragraph, index) => (
              paragraph.length > 0 ? (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              )
            ))}
          </div>

          {isLongContent && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 touch-none"
              aria-expanded={isExpanded}
              aria-controls={`content-${post._id}`}
            >
              <span>{isExpanded ? 'Show less' : 'Show more'}</span>
              <span className="text-xs" aria-hidden="true">
                {isExpanded ? '▲' : '▼'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditPostDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
        initialTitle={post.title}
        initialContent={post.content}
        type="post"
      />
    </article>
  );

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 rounded-lg bg-error/10 border border-error/20">
          <h2 className="text-lg font-semibold text-error mb-2">
            Failed to load post
          </h2>
          <p className="text-sm text-error/80">
            There was an error displaying this post. Our team has been notified.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Reload page
          </button>
        </div>
      }
    >
      {PostContent}
    </ErrorBoundary>
  );
}