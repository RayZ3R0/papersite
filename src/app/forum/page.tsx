'use client';

import { useState, useEffect } from 'react';
import { useForumUser } from '@/hooks/useForumUser';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  authorName: string;
  tags: string[];
  replyCount: number;
  createdAt: string;
}

export default function ForumPage() {
  const { user, setUsername, isLoading } = useForumUser();
  const [username, setUsernameInput] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/forum/posts');
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsPostsLoading(false);
      }
    }

    if (user) {
      fetchPosts();
    } else {
      setIsPostsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-surface rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Welcome to the Forum</h1>
        <p className="mb-4 text-text-muted">
          Please enter a username to start participating in discussions.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setUsername(username);
          }}
          className="space-y-4"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-2 border rounded bg-background text-text"
            maxLength={50}
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Get Started
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forum Discussions</h1>
        <Link
          href="/forum/new"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {isPostsLoading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            No posts yet. Be the first to start a discussion!
          </div>
        ) : (
          posts.map((post) => (
            <Link
              key={post._id}
              href={`/forum/posts/${post._id}`}
              className="block p-4 bg-surface rounded-lg hover:shadow transition-shadow"
            >
              <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
              <div className="flex items-center text-sm text-text-muted">
                <span>By {post.authorName}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{post.replyCount} replies</span>
              </div>
              {post.tags.length > 0 && (
                <div className="mt-2 space-x-2">
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
            </Link>
          ))
        )}
      </div>
    </div>
  );
}