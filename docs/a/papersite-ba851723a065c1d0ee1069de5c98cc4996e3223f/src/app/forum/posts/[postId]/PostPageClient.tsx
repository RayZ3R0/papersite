// Keeping the existing imports
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import ProtectedContent from '@/components/auth/ProtectedContent';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';
import PostContent from '@/components/forum/PostContent';
import ReplyContent from '@/components/forum/ReplyContent';
import ReplyEditor from '@/components/forum/ReplyEditor';

interface UserInfo {
  role: string;
  verified: boolean;
}

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
  replyCount: number;
  userInfo?: UserInfo;
}

interface Reply {
  _id: string;
  content: string;
  author: string;
  username: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  userInfo?: UserInfo;
}

interface PostPageClientProps {
  initialData: {
    post: Post;
    replies: Reply[];
  } | null;
}

export default function PostPageClient({ initialData }: PostPageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(initialData?.post || null);
  const [replies, setReplies] = useState<Reply[]>(initialData?.replies || []);
  const [error, setError] = useState('');

  const handleReplyCreated = useCallback((response: any) => {
    // Extract the reply from the wrapped response
    const newReply = response.data?.reply;
    if (!newReply?._id) return; // Guard against malformed data

    // Format userInfo to match our interface
    const formattedReply: Reply = {
      ...newReply,
      userInfo: newReply.userInfo ? {
        role: newReply.userInfo.role || 'user',
        verified: newReply.userInfo.verified || false
      } : undefined
    };

    setReplies(prev => [...prev, formattedReply]);
    setPost(prev => prev ? {
      ...prev,
      replyCount: (prev.replyCount || 0) + 1
    } : null);
  }, []);

  async function handleEditPost(title: string, content: string) {
    try {
      const response = await fetch(`/api/forum/posts/${post?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const data = await response.json();
      setPost(data.data.post);
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

      const data = await response.json();
      setReplies(prev => 
        prev.map(reply => 
          reply._id === replyId ? data.data.reply : reply
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

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${post?._id}`, {
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
          targetId: post?._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to pin/unpin post');
      }

      const data = await response.json();
      setPost(prev => prev ? { ...prev, isPinned: data.data.post.isPinned } : null);
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
          targetId: post?._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to lock/unlock post');
      }

      const data = await response.json();
      setPost(prev => prev ? { ...prev, isLocked: data.data.post.isLocked } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock/unlock post');
    }
  }

  if (!initialData) {
    return (
      <div className="text-center py-8 text-text-muted">
        Post not found
      </div>
    );
  }

  return (
    <ProtectedContent
      roles={['user', 'moderator', 'admin']}
      message="Please sign in to view this post"
    >
      <div className="container mx-auto p-4 max-w-4xl">
        {error ? (
          <div className="p-4 bg-error/10 text-error rounded">
            {error}
          </div>
        ) : post ? (
          <div className="space-y-6">
            <PostContent
              post={post}
              onEdit={handleEditPost}
              onDelete={handleDelete}
              onPin={handlePin}
              onLock={handleLock}
            />
            
            <div className="space-y-6">
              <div className="space-y-4">
                {(replies || []).map(reply => (
                  <ReplyContent
                    key={reply._id}
                    reply={reply}
                    isLocked={post.isLocked}
                    onEdit={(content) => handleEditReply(reply._id, content)}
                    onDelete={() => handleDeleteReply(reply._id)}
                  />
                ))}
              </div>

              {!post.isLocked && (
                <ReplyEditor
                  postId={post._id}
                  onReplyCreated={handleReplyCreated}
                  className="mt-6"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            Post not found
          </div>
        )}
      </div>
    </ProtectedContent>
  );
}