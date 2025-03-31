'use server';

import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';

/**
 * Populate a post with user info
 */
export async function populatePost(post: any) {
  if (!post) return null;

  // During build, return the post as is
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return post;
  }
  
  await Post.populate(post, {
    path: 'userInfo',
    select: 'username role verified'
  });

  return post;
}

/**
 * Get a formatted post with populated user info
 */
export async function getFormattedPost(postId: string) {
  // During build, return mock data
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return {
      post: {
        _id: postId,
        title: 'Mock Post',
        content: 'Mock Content',
        author: 'mock-author',
        username: 'mock-user',
        createdAt: new Date(),
        edited: false,
        likes: [],
        views: 0,
        isPinned: false,
        isLocked: false,
        tags: [],
        replyCount: 0
      },
      replies: []
    };
  }

  const post = await Post.findById(postId);
  if (!post) return null;

  const populatedPost = await populatePost(post);
  const replies = await Reply.find({ postId })
    .sort('createdAt')
    .populate('userInfo', 'username role verified');

  return {
    post: populatedPost,
    replies
  };
}

/**
 * Check if a post exists and throw if not found
 */
export async function validatePostExists(postId: string): Promise<void> {
  // Skip validation during build
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return;
  }

  const exists = await Post.exists({ _id: postId });
  if (!exists) {
    throw new Error('Post not found');
  }
}

/**
 * Check if a reply exists and throw if not found
 */
export async function validateReplyExists(replyId: string): Promise<void> {
  // Skip validation during build
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return;
  }

  const exists = await Reply.exists({ _id: replyId });
  if (!exists) {
    throw new Error('Reply not found');
  }
}

// Re-export client utilities for server-side use
export * from './client';