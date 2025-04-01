import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/validation';
import { withDb } from '@/lib/api-middleware';
import { jwtToUser } from '@/lib/authTypes';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const handleGet = async (request: NextRequest, context: { params?: { postId?: string } }) => {
  try {
    // Verify user authentication
    await requireAuth();

    // During build, return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        replies: [{
          _id: 'mock-reply-id',
          content: 'Mock reply content',
          author: 'mock-author',
          username: 'mock-user',
          createdAt: new Date().toISOString(),
          edited: false,
          userInfo: {
            username: 'mock-user',
            role: 'user',
            verified: false
          }
        }]
      });
    }

    const { postId } = context.params || {};
    if (!postId || !mongoose.isValidObjectId(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const replies = await Reply.find({ postId })
      .sort('createdAt')
      .populate('userInfo', 'username role verified');

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
};

const handlePost = async (request: NextRequest, context: { params?: { postId?: string } }) => {
  try {
    // Verify user authentication
    const user = await requireAuth();

    // Get post ID and validate
    const { postId } = context.params || {};
    if (!postId || !mongoose.isValidObjectId(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if post exists and is not locked
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: 'This post is locked' },
        { status: 403 }
      );
    }

    // Get reply content
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create reply
    const reply = new Reply({
      postId,
      content,
      author: user._id || user.userId,
      username: user.username
    });

    await reply.save();

    // Increment reply count on post
    await Post.findByIdAndUpdate(postId, {
      $inc: { replyCount: 1 },
      lastReplyAt: new Date()
    });

    // Populate user info
    await Reply.populate(reply, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const GET = withDb(handleGet, { requireConnection: false });
export const POST = withDb(handlePost, { requireConnection: true });

// Handle CORS preflight requests
export const OPTIONS = withDb(async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}, { requireConnection: false });