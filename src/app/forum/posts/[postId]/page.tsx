'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import PostContent from '@/components/forum/PostContent';
import ReplyContent from '@/components/forum/ReplyContent';
import ProtectedContent from '@/components/auth/ProtectedContent';
import { getFormattedPost } from '@/lib/forumUtils';
import LoginModal from '@/components/auth/LoginModal';

interface ForumPostPageProps {
  params: {
    postId: string;
  };
}

export default function ForumPostPage({ params }: ForumPostPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Fetch post and replies
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/forum/posts/${params.postId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch post');
        }

        setPost(data.post);
        setReplies(data.replies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.postId]);

  // Handle post pinning
  const handlePin = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });

      if (!response.ok) throw new Error('Failed to pin post');
      setPost({ ...post, isPinned: !post.isPinned });
    } catch (err) {
      console.error('Error pinning post:', err);
    }
  };

  // Handle post locking
  const handleLock = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !post.isLocked }),
      });

      if (!response.ok) throw new Error('Failed to lock post');
      setPost({ ...post, isLocked: !post.isLocked });
    } catch (err) {
      console.error('Error locking post:', err);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/forum/posts/${post._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');
      router.push('/forum');
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          content: replyContent.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit reply');

      const newReply = await response.json();
      setReplies([...replies, newReply]);
      setReplyContent('');
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !post) {
    return <div>Error: {error || 'Post not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <PostContent
        post={post}
        onPin={handlePin}
        onLock={handleLock}
        onDelete={handleDelete}
      />

      <div className="space-y-4">
        {replies.map(reply => (
          <ReplyContent
            key={reply._id}
            reply={reply}
            isLocked={post.isLocked}
          />
        ))}
      </div>

      {!post.isLocked ? (
        <ProtectedContent
          message="Please sign in to reply"
          onAuthFailure={() => setShowLoginModal(true)}
        >
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              rows={4}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Reply
            </button>
          </form>
        </ProtectedContent>
      ) : (
        <div className="p-4 text-center text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          This post is locked. New replies cannot be added.
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        returnTo={`/forum/posts/${params.postId}`}
      />
    </div>
  );
}