'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForumUser, requireUser } from '@/hooks/useForumUser';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';
import { PostContent } from '@/components/forum/PostContent';
import { ReplyContent } from '@/components/forum/ReplyContent';
import { sanitizeContent } from '@/lib/forumUtils';

interface Post {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  tags: string[];
  replyCount: number;
  createdAt: string;
}

interface Reply {
  _id: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: string;
}

export default function PostPage({ params }: { params: { postId: string } }) {
  const router = useRouter();
  const { user, isLoading } = useForumUser();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/forum/posts/${params.postId}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data.post);
        setReplies(data.replies);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setError('Failed to load post');
      } finally {
        setIsLoadingPost(false);
      }
    }

    fetchPost();
  }, [params.postId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      requireUser(user);

      const cleanContent = sanitizeContent(replyContent);
      if (!cleanContent) {
        throw new Error('Reply content cannot be empty');
      }

      const response = await fetch(`/api/forum/posts/${params.postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: cleanContent,
          authorName: user.name,
          authorId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post reply');
      }

      const newReply = await response.json();
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostDelete = () => {
    router.push('/forum');
  };

  const handleReplyDelete = (replyId: string) => {
    setReplies(prev => prev.filter(reply => reply._id !== replyId));
    if (post) {
      setPost({ ...post, replyCount: post.replyCount - 1 });
    }
  };

  if (isLoading || isLoadingPost) {
    return (
      <div className="container mx-auto p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-text-muted">
          {error || 'Post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <PostContent post={post} onDelete={handlePostDelete} />

      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-6">
          Replies ({post.replyCount})
        </h2>
        
        {!user ? (
          <div className="text-center py-4 text-text-muted">
            Please enter a username to participate in discussions.
          </div>
        ) : (
          <form onSubmit={handleSubmitReply} className="mb-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border rounded bg-background text-text min-h-[100px]"
              required
              maxLength={5000}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {replies.map((reply) => (
            <ReplyContent
              key={reply._id}
              reply={reply}
              postId={post._id}
              onDelete={() => handleReplyDelete(reply._id)}
            />
          ))}
          {replies.length === 0 && (
            <div className="text-center py-4 text-text-muted">
              No replies yet. Be the first to reply!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}