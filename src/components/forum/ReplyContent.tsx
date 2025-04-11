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
    <article 
      className="bg-surface rounded-lg shadow-sm border border-divider overflow-hidden mb-3"
      aria-labelledby={`reply-author-${reply._id}`}
    >
      <div className="divide-y divide-divider">
        {/* Header */}
        <header className="px-6 py-2.5 bg-surface-alt/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <span 
                  id={`reply-author-${reply._id}`}
                  className="font-medium text-text"
                >
                  {reply.username}
                  {reply.userInfo?.verified && (
                    <span className="ml-0.5 text-primary" title="Verified user" aria-label="Verified user">
                      ✓
                    </span>
                  )}
                </span>
                {reply.userInfo?.role !== 'user' && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-surface-alt text-text-muted">
                    {reply.userInfo?.role}
                  </span>
                )}
                <span className="text-text-muted" aria-hidden="true">•</span>
                <time 
                  dateTime={new Date(reply.createdAt).toISOString()} 
                  className="text-text-muted"
                >
                  {formatDate(reply.createdAt)}
                </time>
                {reply.edited && (
                  <>
                    <span className="text-text-muted" aria-hidden="true">•</span>
                    <time
                      dateTime={reply.editedAt ? new Date(reply.editedAt).toISOString() : undefined}
                      className="text-text-muted"
                      title={reply.editedAt ? formatDate(reply.editedAt) : undefined}
                    >
                      edited
                    </time>
                  </>
                )}
              </div>
            </div>

            {/* Action Menu */}
            {!isLocked && (
              <div className="flex-shrink-0 -mr-2">
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
            <div className="mt-2 text-sm text-error" role="alert">
              {error}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="px-6 py-3.5">
          <div 
            className="prose prose-text max-w-none break-words whitespace-pre-wrap"
            id={`reply-content-${reply._id}`}
          >
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
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              aria-expanded={isExpanded}
              aria-controls={`reply-content-${reply._id}`}
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
        initialContent={reply.content}
        type="reply"
      />
    </article>
  );
}