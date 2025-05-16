import { withDb } from '@/lib/api-middleware';
import { Post } from '@/models/Post';
import mongoose from 'mongoose';

interface ActionMetadata {
  performedAt: Date;
  performedBy: string;
}

/**
 * Pin/Unpin a post
 */
export const pinPost = withDb(async (postId: string, metadata: ActionMetadata) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.isPinned = !post.isPinned;
  post.modifiedBy = {
    action: 'pin',
    performedAt: metadata.performedAt,
    performedBy: metadata.performedBy,
    previousState: !post.isPinned
  };
  await post.save();

  return post;
}, { requireConnection: true });

/**
 * Lock/Unlock a post
 */
export const lockPost = withDb(async (postId: string, metadata: ActionMetadata) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.isLocked = !post.isLocked;
  post.modifiedBy = {
    action: 'lock',
    performedAt: metadata.performedAt,
    performedBy: metadata.performedBy,
    previousState: !post.isLocked
  };
  await post.save();

  return post;
}, { requireConnection: true });

/**
 * Soft delete a post
 */
export const deletePost = withDb(async (postId: string, metadata: ActionMetadata) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.isDeleted = true;
  post.deletedAt = metadata.performedAt;
  post.deletedBy = metadata.performedBy;
  post.modifiedBy = {
    action: 'delete',
    performedAt: metadata.performedAt,
    performedBy: metadata.performedBy,
    previousState: false
  };
  await post.save();

  return post;
}, { requireConnection: true });

/**
 * Restore a deleted post
 */
export const restorePost = withDb(async (postId: string, metadata: ActionMetadata) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  if (!post.isDeleted) {
    throw new Error('Post is not deleted');
  }

  post.isDeleted = false;
  post.deletedAt = undefined;
  post.deletedBy = undefined;
  post.modifiedBy = {
    action: 'restore',
    performedAt: metadata.performedAt,
    performedBy: metadata.performedBy,
    previousState: true
  };
  await post.save();

  return post;
}, { requireConnection: true });

/**
 * Get admin action history for a post
 */
export const getPostHistory = withDb(async (postId: string) => {
  const post = await Post.findById(postId, {
    modifiedBy: 1,
    deletedAt: 1,
    deletedBy: 1
  });

  if (!post) {
    throw new Error('Post not found');
  }

  return {
    currentState: {
      isDeleted: post.isDeleted || false,
      isPinned: post.isPinned || false,
      isLocked: post.isLocked || false
    },
    lastModification: post.modifiedBy,
    deletionInfo: post.isDeleted ? {
      deletedAt: post.deletedAt,
      deletedBy: post.deletedBy
    } : null
  };
}, { requireConnection: true });