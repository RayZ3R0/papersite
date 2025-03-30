'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import UserActionMenu from './UserActionMenu';
import { formatDate } from '@/lib/forumUtils';

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
  onEdit?: () => void;
  onDelete?: () => void;
  isLocked?: boolean;
}

export default function ReplyContent({
  reply,
  onEdit,
  onDelete,
  isLocked
}: ReplyContentProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          {/* Author info */}
          <div className="text-sm">
            <span className="font-medium text-gray-900 dark:text-white">
              {reply.username}
              {reply.userInfo?.verified && (
                <span className="ml-1 text-blue-500" title="Verified user">
                  ✓
                </span>
              )}
            </span>
            {reply.userInfo?.role !== 'user' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {reply.userInfo?.role}
              </span>
            )}
            <span className="ml-2 text-gray-500">
              {formatDate(reply.createdAt)}
            </span>
            {reply.edited && (
              <span className="ml-2 text-gray-500" title={reply.editedAt ? formatDate(reply.editedAt) : undefined}>
                (edited)
              </span>
            )}
          </div>

          {/* Action menu */}
          {!isLocked && (
            <UserActionMenu
              authorId={reply.author}
              onEdit={onEdit}
              onDelete={onDelete}
              type="reply"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="prose dark:prose-invert max-w-none">
          {reply.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}