'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForumUser, requireUser } from '@/hooks/useForumUser';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';
import { AdminControls } from '@/components/forum/AdminControls';

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

      const response = await fetch(`/api/forum/posts/${params.postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
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
    return <LoadingSpinner />;
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
      <article className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-sm text-text-muted mb-4">
          <span>By {post.authorName}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mb-4 space-x-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-surface-alt rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="prose dark:prose-invert max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
        <AdminControls postId={post._id} onDelete={handlePostDelete} />
      </article>

      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-6">Replies</h2>
        
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
            <div key={reply._id} className="p-4 bg-surface rounded">
              <div className="flex items-center text-sm text-text-muted mb-2">
                <span>{reply.authorName}</span>
                <span className="mx-2">•</span>
                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {reply.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
              <AdminControls 
                postId={post._id}
                replyId={reply._id}
                onDelete={() => handleReplyDelete(reply._id)}
              />
            </div>
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