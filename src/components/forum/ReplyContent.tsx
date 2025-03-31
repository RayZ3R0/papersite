'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import UserActionMenu from './UserActionMenu';
import EditPostDialog from './EditPostDialog';
import { formatDate, canPerformAction } from '@/lib/forumUtils';

interface ReplyContentProps {
  reply: {
    _id: string;
    content: string;
    author: string;
    username: string;
    createdAt: string | Date;
    edited: boolean;
    editedAt?: string | Date;
    userInfo?: {
      role: string;
      verified: boolean;
    };
  };
  isLocked?: boolean;
  onEdit?: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ReplyContent({
  reply,
  isLocked,
  onEdit,
  onDelete
}: ReplyContentProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [error, setError] = useState('');

  const contentLength = reply.content.length;
  const isLongContent = contentLength > 300;
  const displayContent = isLongContent && !isExpanded 
    ? reply.content.slice(0, 300) + '...' 
    : reply.content;

  const handleEdit = async (_: string, content: string) => {
    try {
      if (!onEdit || isLocked) return;
      await onEdit(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit reply');
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow mb-4 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-divider">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0"> {/* Add min-width to enable text wrapping */}
            {/* Author info */}
            <div className="text-sm">
              <span className="font-medium text-text">
                {reply.username}
                {reply.userInfo?.verified && (
                  <span className="ml-1 text-primary" title="Verified user">
                    ✓
                  </span>
                )}
              </span>
              {reply.userInfo?.role !== 'user' && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-surface-alt text-text-muted">
                  {reply.userInfo?.role}
                </span>
              )}
              <span className="ml-2 text-text-muted whitespace-nowrap">
                {formatDate(reply.createdAt)}
              </span>
              {reply.edited && (
                <span className="ml-2 text-text-muted" title={reply.editedAt ? formatDate(reply.editedAt) : undefined}>
                  (edited)
                </span>
              )}
            </div>
          </div>

          {/* Action Menu - Keep it from shrinking */}
          {!isLocked && (
            <div className="flex-shrink-0">
              <UserActionMenu
                authorId={reply.author}
                onEdit={() => setIsEditOpen(true)}
                onDelete={onDelete}
                type="reply"
              />
            </div>
          )}
        </div>

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
        initialContent={reply.content}
        type="reply"
      />
    </div>
  );
}