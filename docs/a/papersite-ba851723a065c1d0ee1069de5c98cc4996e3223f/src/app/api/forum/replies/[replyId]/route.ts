import { NextRequest, NextResponse } from 'next/server';
import { Reply } from '@/models/Reply';
import { withDb, handleOptions, createErrorResponse } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import mongoose from 'mongoose';
// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Maximum duration for long operations
export const maxDuration = 10; // 10 seconds

function getReplyId(request: NextRequest): string | null {
  const segments = request.url.split('/');
  const replyId = segments[segments.length - 1];
  return mongoose.isValidObjectId(replyId) ? replyId : null;
}

export const GET = withDb(async (request: NextRequest) => {
  try {
    // During build, return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        reply: {
          _id: 'mock-reply-id',
          content: 'Mock Reply Content',
          author: 'mock-author',
          username: 'mock-user',
          postId: 'mock-post-id',
          createdAt: new Date(),
          edited: false,
          likes: []
        }
      });
    }

    const replyId = getReplyId(request);
    if (!replyId) {
      return createErrorResponse('Invalid reply ID', 400);
    }

    const reply = await Reply.findById(replyId)
      .populate('userInfo', 'username role verified');

    if (!reply) {
      return createErrorResponse('Reply not found', 404);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error fetching reply:', error);
    return createErrorResponse('Failed to fetch reply');
  }
}, { requireConnection: false }); // Allow static builds with mock data

export const DELETE = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const replyId = getReplyId(request);
    if (!replyId) {
      return createErrorResponse('Invalid reply ID', 400);
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return createErrorResponse('Reply not found', 404);
    }

    // Check if user is author or admin
    if (reply.author.toString() !== payload.userId && payload.role !== 'admin') {
      return createErrorResponse('Not authorized to delete this reply', 403);
    }

    await reply.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return createErrorResponse('Failed to delete reply');
  }
}, { requireConnection: true }); // Require DB connection for writes

export const PATCH = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const replyId = getReplyId(request);
    if (!replyId) {
      return createErrorResponse('Invalid reply ID', 400);
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return createErrorResponse('Reply not found', 404);
    }

    // Check if user is author or admin
    if (reply.author.toString() !== payload.userId && payload.role !== 'admin') {
      return createErrorResponse('Not authorized to edit this reply', 403);
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return createErrorResponse('Content is required', 400);
    }

    reply.content = content;
    reply.edited = true;
    reply.editedAt = new Date();

    await reply.save();

    // Populate user info before returning
    await Reply.populate(reply, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error updating reply:', error);
    return createErrorResponse('Failed to update reply');
  }
}, { requireConnection: true }); // Require DB connection for writes

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'DELETE', 'PATCH', 'OPTIONS']);