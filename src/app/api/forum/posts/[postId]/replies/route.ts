import { NextRequest, NextResponse } from 'next/server';
import { Reply } from '@/models/Reply';
import { Post } from '@/models/Post';
import { withDb, handleOptions, createErrorResponse } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import mongoose from 'mongoose';

// Make route dynamic
export const dynamic = 'force-dynamic';

function getPostId(request: NextRequest): string | null {
  const segments = request.url.split('/');
  const idx = segments.findIndex(s => s === 'posts') + 1;
  if (idx < segments.length) {
    const postId = segments[idx];
    return mongoose.isValidObjectId(postId) ? postId : null;
  }
  return null;
}

export const GET = withDb(async (request: NextRequest) => {
  try {
    // During build, return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({ replies: [] });
    }

    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    const replies = await Reply.find({ postId })
      .sort({ createdAt: 1 })
      .populate('userInfo', 'username role verified');

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return createErrorResponse('Failed to fetch replies');
  }
}, { requireConnection: false }); // Allow static builds with empty data

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();
    
    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    // During build, return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        reply: {
          _id: 'mock-reply-id',
          content: 'Mock Reply',
          author: payload.userId,
          username: payload.username,
          postId,
          createdAt: new Date(),
          edited: false,
          likes: []
        }
      });
    }

    // Check if post exists and is not locked
    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    if (post.isLocked) {
      return createErrorResponse('This post is locked', 403);
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return createErrorResponse('Content is required', 400);
    }

    const reply = new Reply({
      postId,
      content,
      author: payload.userId,
      username: payload.username
    });

    await reply.save();

    // Increment reply count on the post
    await Post.findByIdAndUpdate(postId, {
      $inc: { replyCount: 1 },
      lastReplyAt: new Date()
    });

    // Populate user info before returning
    await Reply.populate(reply, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error creating reply:', error);
    return createErrorResponse('Failed to create reply');
  }
}, { requireConnection: true }); // Require DB connection for writes

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'POST', 'OPTIONS']);