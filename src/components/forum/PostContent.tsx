'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import UserActionMenu from './UserActionMenu';
import { formatDate } from '@/lib/forumUtils';

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
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onLock?: () => void;
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

  const contentLength = post.content.length;
  const isLongContent = contentLength > 500;
  const displayContent = isLongContent && !isExpanded 
    ? post.content.slice(0, 500) + '...' 
    : post.content;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {post.isPinned && (
                <span className="inline-block mr-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  📌
                </span>
              )}
              {post.title}
            </h2>

            {/* Author info */}
            <div className="mt-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Posted by </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {post.username}
                {post.userInfo?.verified && (
                  <span className="ml-1 text-blue-500" title="Verified user">
                    ✓
                  </span>
                )}
              </span>
              {post.userInfo?.role !== 'user' && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {post.userInfo?.role}
                </span>
              )}
              <span className="ml-2 text-gray-500">
                {formatDate(post.createdAt)}
              </span>
              {post.edited && (
                <span className="ml-2 text-gray-500" title={post.editedAt ? formatDate(post.editedAt) : undefined}>
                  (edited)
                </span>
              )}
            </div>
          </div>

          {/* Action menu */}
          <UserActionMenu
            authorId={post.author}
            onEdit={onEdit}
            onDelete={onDelete}
            onPin={onPin}
            onLock={onLock}
            isPinned={post.isPinned}
            isLocked={post.isLocked}
            type="post"
          />
        </div>

        {post.isLocked && (
          <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            🔒 This post has been locked
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="prose dark:prose-invert max-w-none">
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
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}