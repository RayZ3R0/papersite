import { NextRequest, NextResponse } from 'next/server';
import { Reply } from '@/models/Reply';
import { Post } from '@/models/Post';
import { withDb, createErrorResponse, createSuccessResponse, isValidObjectId } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import { ValidationError, MongoError } from '@/types/registration';
import { Types } from 'mongoose';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Set maximum duration for operations
export const maxDuration = 5;

function getPostId(request: NextRequest): string | null {
  const segments = request.url.split('/');
  const idx = segments.findIndex(s => s === 'posts') + 1;
  if (idx < segments.length) {
    const postId = segments[idx];
    return isValidObjectId(postId) ? postId : null;
  }
  return null;
}

export const GET = withDb(async (request: NextRequest) => {
  try {
    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    // First check if post exists and is accessible
    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    if (post.isDeleted) {
      return createErrorResponse('Post has been deleted', 410);
    }

    // Fetch replies with user info
    const replies = await Reply.find({ 
      postId,
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: 1 })
      .populate('userInfo', 'username role verified')
      .lean()
      .exec();

    // Format response data
    const formattedReplies = replies.map(reply => ({
      ...reply,
      _id: reply._id.toString(),
      author: reply.author.toString(),
      createdAt: reply.createdAt?.toISOString(),
      editedAt: reply.editedAt?.toISOString(),
      userInfo: reply.userInfo ? {
        role: reply.userInfo.role || 'user',
        verified: reply.userInfo.verified || false
      } : undefined
    }));

    return createSuccessResponse({ 
      replies: formattedReplies
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return createErrorResponse('Failed to fetch replies');
  }
});

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();
    
    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    // Check if post exists and is not locked
    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    if (post.isDeleted) {
      return createErrorResponse('Cannot reply to a deleted post', 410);
    }

    if (post.isLocked) {
      return createErrorResponse('This post is locked', 403);
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return createErrorResponse('Content is required', 400);
    }

    if (content.length > 10000) {
      return createErrorResponse('Content exceeds maximum length (max 10000 characters)', 400);
    }

    // Create reply with session to ensure atomic operations
    const session = await Reply.startSession();
    let newReply: any = null;

    try {
      await session.withTransaction(async () => {
        // Create reply
        const result = await Reply.create([{
          postId,
          content: content.trim(),
          author: payload.userId.toString(),
          username: payload.username,
          createdAt: new Date()
        }], { session });

        // Get the created reply
        newReply = result[0];

        // Update post
        await Post.findByIdAndUpdate(postId, {
          $inc: { replyCount: 1 },
          lastReplyAt: new Date()
        }, { session });

        // Populate user info
        await Reply.populate(newReply, {
          path: 'userInfo',
          select: 'username role verified'
        });
      });
    } finally {
      await session.endSession();
    }

    if (!newReply) {
      return createErrorResponse('Failed to create reply', 500);
    }

    // Format response data to match interface
    const formattedReply = {
      ...newReply.toObject(),
      _id: newReply._id.toString(),
      author: newReply.author.toString(),
      createdAt: newReply.createdAt?.toISOString(),
      editedAt: newReply.editedAt?.toISOString(),
      userInfo: newReply.userInfo ? {
        role: newReply.userInfo.role || 'user',
        verified: newReply.userInfo.verified || false
      } : undefined
    };

    return createSuccessResponse({
      message: 'Reply created successfully',
      reply: formattedReply
    }, 201);
  } catch (error: unknown) {
    console.error('Error creating reply:', error);

    if (error && (error as ValidationError).name === 'ValidationError') {
      const validationError = error as ValidationError;
      const messages = Object.values(validationError.errors)
        .map(err => err.message)
        .join(', ');
      return createErrorResponse(`Validation failed: ${messages}`, 400);
    }

    if (error && (error as MongoError).code === 11000) {
      return createErrorResponse('Duplicate reply detected', 409);
    }

    return createErrorResponse('Failed to create reply', 500);
  }
});

// Handle preflight requests
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}