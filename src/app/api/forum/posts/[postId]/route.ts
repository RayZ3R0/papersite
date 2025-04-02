import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import { withDb, handleOptions, createErrorResponse } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import mongoose from 'mongoose';

// Make route dynamic
export const dynamic = 'force-dynamic';

function getPostId(request: NextRequest): string | null {
  const segments = request.url.split('/');
  const postId = segments[segments.length - 1];
  return mongoose.isValidObjectId(postId) ? postId : null;
}

export const GET = withDb(async (request: NextRequest) => {
  try {
    // During build, return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        post: {
          _id: 'mock-id',
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
      });
    }

    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(postId).populate('userInfo', 'username role verified');
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    // Get replies for this post
    const replies = await Reply.find({ postId })
      .sort({ createdAt: 1 })
      .populate('userInfo', 'username role verified');

    return NextResponse.json({ post, replies });
  } catch (error) {
    console.error('Error fetching post:', error);
    return createErrorResponse('Failed to fetch post');
  }
}, { requireConnection: false }); // Allow static builds with mock data

export const DELETE = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    // Check if user is author or admin
    if (post.author.toString() !== payload.userId && payload.role !== 'admin') {
      return createErrorResponse('Not authorized to delete this post', 403);
    }

    // Delete all replies first
    await Reply.deleteMany({ postId });

    // Delete the post
    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Post and replies deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return createErrorResponse('Failed to delete post');
  }
}, { requireConnection: true }); // Require DB connection for writes

export const PATCH = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    // Check if user is author or admin
    if (post.author.toString() !== payload.userId && payload.role !== 'admin') {
      return createErrorResponse('Not authorized to edit this post', 403);
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title && !content) {
      return createErrorResponse('No changes provided', 400);
    }

    // Update only provided fields
    if (title) post.title = title;
    if (content) post.content = content;
    post.edited = true;
    post.editedAt = new Date();

    await post.save();
    await Post.populate(post, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    return createErrorResponse('Failed to update post');
  }
}, { requireConnection: true }); // Require DB connection for writes

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'DELETE', 'PATCH', 'OPTIONS']);