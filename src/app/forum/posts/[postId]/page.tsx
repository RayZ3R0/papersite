'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import ProtectedContent from '@/components/auth/ProtectedContent';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';
import PostContent from '@/components/forum/PostContent';
import ReplyContent from '@/components/forum/ReplyContent';
import ReplyForm from '@/components/forum/ReplyForm';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  username: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  userInfo?: {
    role: string;
    verified: boolean;
  };
}

interface Reply {
  _id: string;
  content: string;
  author: string;
  username: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  userInfo?: {
    role: string;
    verified: boolean;
  };
}

export default function PostPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const [postRes, repliesRes] = await Promise.all([
          fetch(`/api/forum/posts/${postId}`),
          fetch(`/api/forum/posts/${postId}/replies`),
        ]);

        if (!postRes.ok || !repliesRes.ok) {
          throw new Error('Failed to fetch post data');
        }

        const [postData, repliesData] = await Promise.all([
          postRes.json(),
          repliesRes.json(),
        ]);

        setPost(postData.post);
        setReplies(repliesData.replies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  async function handleEditPost(title: string, content: string) {
    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const { post: updatedPost } = await response.json();
      setPost(updatedPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    }
  }

  async function handleEditReply(replyId: string, content: string) {
    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reply');
      }

      const { reply: updatedReply } = await response.json();
      setReplies(prev => 
        prev.map(reply => 
          reply._id === replyId ? updatedReply : reply
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reply');
      throw err;
    }
  }

  async function handleDeleteReply(replyId: string) {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reply');
      }

      setReplies(prev => prev.filter(reply => reply._id !== replyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reply');
    }
  }

  async function handleDeletePost() {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      router.push('/forum');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  }

  async function handlePin() {
    try {
      const response = await fetch(`/api/forum/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'pin',
          targetId: postId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to pin/unpin post');
      }

      const data = await response.json();
      setPost(prev => prev ? { ...prev, isPinned: data.post.isPinned } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pin/unpin post');
    }
  }

  async function handleLock() {
    try {
      const response = await fetch(`/api/forum/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'lock',
          targetId: postId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to lock/unlock post');
      }

      const data = await response.json();
      setPost(prev => prev ? { ...prev, isLocked: data.post.isLocked } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock/unlock post');
    }
  }

  const handleReplyAdded = (newReply: Reply) => {
    setReplies(prev => [...prev, newReply]);
  };

  return (
    <ProtectedContent
      roles={['user', 'moderator', 'admin']}
      message="Please sign in to view this post"
    >
      <div className="container mx-auto p-4 max-w-4xl space-y-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="p-4 bg-error/10 text-error rounded-lg">
            {error}
          </div>
        ) : post ? (
          <>
            <PostContent
              post={post}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onPin={handlePin}
              onLock={handleLock}
            />
            
            <div className="space-y-4">
              {replies.map(reply => (
                <ReplyContent
                  key={reply._id}
                  reply={reply}
                  isLocked={post.isLocked}
                  onEdit={(content) => handleEditReply(reply._id, content)}
                  onDelete={() => handleDeleteReply(reply._id)}
                />
              ))}
            </div>

            <div className="pt-6">
              <ReplyForm
                postId={post._id}
                isLocked={post.isLocked}
                onReplyAdded={handleReplyAdded}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-text-muted">
            Post not found
          </div>
        )}
      </div>
    </ProtectedContent>
  );
}