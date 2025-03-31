'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import UserActionMenu from './UserActionMenu';
import EditPostDialog from './EditPostDialog';
import { formatDate, canPerformAction } from '@/lib/forumUtils';

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

  const contentLength = post.content.length;
  const isLongContent = contentLength > 500;
  const displayContent = isLongContent && !isExpanded 
    ? post.content.slice(0, 500) + '...' 
    : post.content;

  const handleEdit = async (title: string, content: string) => {
    try {
      if (!onEdit) return;
      await onEdit(title, content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit post');
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-divider">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0"> {/* Add min-width to enable text wrapping */}
            {/* Title */}
            <h2 className="text-xl font-semibold text-text break-words pr-4">
              {post.isPinned && (
                <span className="inline-block mr-2 text-sm font-medium text-primary">
                  📌
                </span>
              )}
              {post.title}
            </h2>

            {/* Author info */}
            <div className="mt-1 text-sm">
              <span className="text-text-muted">Posted by </span>
              <span className="font-medium text-text">
                {post.username}
                {post.userInfo?.verified && (
                  <span className="ml-1 text-primary" title="Verified user">
                    ✓
                  </span>
                )}
              </span>
              {post.userInfo?.role !== 'user' && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-surface-alt text-text-muted">
                  {post.userInfo?.role}
                </span>
              )}
              <span className="ml-2 text-text-muted whitespace-nowrap">
                {formatDate(post.createdAt)}
              </span>
              {post.edited && (
                <span className="ml-2 text-text-muted" title={post.editedAt ? formatDate(post.editedAt) : undefined}>
                  (edited)
                </span>
              )}
            </div>
          </div>

          {/* Action Menu - Keep it from shrinking */}
          <div className="flex-shrink-0">
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

        {post.isLocked && (
          <div className="mt-2 text-sm text-warning">
            🔒 This post has been locked
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-error">
            {error}
          </div>
        )}
      </div>

      {/* Content with word wrapping */}
      <div className="px-6 py-4">
        <div className="prose prose-text max-w-none break-words whitespace-pre-wrap">
          {displayContent.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Show more/less button */}
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
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
    </div>
  );
}