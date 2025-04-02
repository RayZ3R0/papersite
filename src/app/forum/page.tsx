'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import ProtectedContent from '@/components/auth/ProtectedContent';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';
import Link from 'next/link';
import ForumHeader from '@/components/forum/ForumHeader';

interface Post {
  _id: string;
  title: string;
  authorName: string;
  tags: string[];
  replyCount: number;
  createdAt: string;
}

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/forum/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch posts if user is authenticated
    if (user) {
      fetchPosts();
    }
  }, [user]); // Depend on user to refetch when auth state changes

  return (
    <>
      <ForumHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-text">Welcome to Our Forum</h1>
          <p className="text-text-muted mb-8">
            Join our community to participate in discussions, share your thoughts,
            and connect with others.
          </p>
          <div className="p-6 bg-surface rounded-lg shadow-sm border border-divider mb-8">
            <p className="text-lg font-medium mb-4 text-text">
              What you can do in our forum:
            </p>
            <ul className="text-text-muted space-y-2 mb-6 text-left list-disc list-inside">
              <li>Start interesting discussions</li>
              <li>Share your knowledge and experiences</li>
              <li>Connect with other members</li>
              <li>Get help from the community</li>
            </ul>
          </div>

          {!user && (
            <div className="mt-8">
              <p className="text-text-muted mb-4">Ready to join the discussion?</p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/auth/login"
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>
          )}
        </div>

        <ProtectedContent
          roles={['user', 'moderator', 'admin']}
          message="Please sign in to access the forum"
          fallback={null}  // Add fallback to prevent redirect
        >
          <div className="mt-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-text">Forum Discussions</h2>
              {user && (
                <Link
                  href="/forum/new"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  New Post
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-text-muted mt-2">Loading discussions...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-error/10 border border-error/20 rounded text-error text-center">
                  {error}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  No posts yet. Be the first to start a discussion!
                </div>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/forum/posts/${post._id}`}
                    className="block p-4 bg-surface rounded-lg hover:shadow transition-all hover:bg-surface-alt"
                  >
                    <h2 className="text-lg font-semibold mb-2 text-text">{post.title}</h2>
                    <div className="flex items-center text-sm text-text-muted">
                      <span>By {post.authorName}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{post.replyCount} replies</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2 space-x-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-surface-alt rounded text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </ProtectedContent>
      </div>
    </>
  );
}