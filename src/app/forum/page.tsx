"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import ProtectedContent from "@/components/auth/ProtectedContent";
import Link from "next/link";
import ForumHeader from "@/components/forum/ForumHeader";
import { useReturnTo } from "@/hooks/useReturnTo";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { ForumLoadingState } from "@/components/forum/ForumLoadingState";
import { performance as perfLogger } from "@/lib/errorUtils";

interface Post {
  _id: string;
  title: string;
  username: string;
  tags: string[];
  replyCount: number;
  createdAt: string;
}

export default function ForumPage() {
  const { user } = useAuth();
  const { saveCurrentPath } = useReturnTo();
  const currentPath = saveCurrentPath();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startTime = window.performance.now();
    let isMounted = true;

    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/forum/posts");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch posts");
        }

        const data = await response.json();
        
        // Track successful load time
        perfLogger.trackPostLoad(window.performance.now() - startTime, true);
        
        if (!isMounted) return;

        // Handle nested data structure and ensure proper date parsing
        const posts = data.data?.posts || [];
        setPosts(posts.map((post: any) => ({
          _id: post._id,
          title: post.title,
          username: post.username,
          tags: post.tags || [],
          replyCount: typeof post.replyCount === 'number' ? post.replyCount : 0,
          createdAt: post.createdAt?.$date?.$numberLong
            ? new Date(parseInt(post.createdAt.$date.$numberLong)).toISOString()
            : post.createdAt || new Date().toISOString()
        })));
      } catch (error) {
        if (!isMounted) return;
        
        // Track failed load time
        perfLogger.trackPostLoad(window.performance.now() - startTime, false);
        
        // Track client error with device info
        perfLogger.trackClientError(
          error instanceof Error ? error : new Error("Failed to load posts"),
          { component: "ForumPage", action: "fetchPosts" }
        );

        setError(error instanceof Error ? error.message : "Failed to load posts");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (user) {
      fetchPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <>
      <ForumHeader />

      <div className="container mx-auto px-4 py-12">
        {!user && (
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="flex justify-center gap-4">
              <Link
                href={`/auth/login?returnTo=${encodeURIComponent(currentPath)}`}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href={`/auth/register?returnTo=${encodeURIComponent(
                  currentPath
                )}`}
                className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        )}

        <ProtectedContent
          roles={["user", "moderator", "admin"]}
          message="Please sign in to access the forum"
          fallback={null}
          customReturnTo={currentPath}
        >
          <div className="mt-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-text">
                Forum Discussions
              </h2>
              <Link
                href="/forum/new"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                New Post
              </Link>
            </div>

            <div className="space-y-4">
              <ErrorBoundary>
                <ForumLoadingState 
                  isLoading={isLoading}
                  error={error}
                  retry={() => {
                    if (user) {
                      setIsLoading(true);
                      setError(null);
                      const startTime = window.performance.now();
                      fetch("/api/forum/posts")
                        .then(res => res.json())
                        .then(data => {
                          perfLogger.trackPostLoad(window.performance.now() - startTime, true);
                          setPosts(data.data?.posts || []);
                        })
                        .catch(err => {
                          perfLogger.trackPostLoad(window.performance.now() - startTime, false);
                          setError(err.message);
                        })
                        .finally(() => setIsLoading(false));
                    }
                  }}
                />
                {!isLoading && !error && posts.length > 0 && (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Link
                        key={post._id}
                        href={`/forum/posts/${post._id}`}
                        className="block p-4 bg-surface rounded-lg hover:shadow transition-all hover:bg-surface-alt"
                      >
                        <h2 className="text-lg font-semibold mb-2 text-text">
                          {post.title}
                        </h2>
                        <div className="flex items-center text-sm text-text-muted">
                          <span>By {post.username}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
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
                    ))}
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </div>
        </ProtectedContent>
      </div>
    </>
  );
}
