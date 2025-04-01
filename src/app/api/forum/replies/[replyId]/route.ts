import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/validation';
import { withDb, handleOptions, ApiContext } from '@/lib/api-middleware';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import { canPerformAction } from '@/lib/forumUtils';
import { JWTPayload } from '@/lib/auth/jwt';
import { UserWithoutPassword, jwtToUser } from '@/lib/authTypes';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const handlePatch = async (request: NextRequest, context: ApiContext) => {
  try {
    // Verify user authentication and get token data
    const authData = await requireAuth();

    // Get reply ID and validate
    const { replyId } = context.params || {};
    if (!replyId || !mongoose.isValidObjectId(replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
        { status: 400 }
      );
    }

    // Find reply
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Check if post is locked
    const post = await Post.findById(reply.postId);
    if (post?.isLocked) {
      return NextResponse.json(
        { error: 'This thread is locked' },
        { status: 403 }
      );
    }

    // Convert auth data to UserWithoutPassword format
    const user = jwtToUser(authData);

    // Check permissions
    if (!canPerformAction('edit', user, reply.author.toString(), 'reply')) {
      return NextResponse.json(
        { error: 'Not authorized to edit this reply' },
        { status: 403 }
      );
    }

    // Get content
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Update reply
    reply.content = content;
    reply.edited = true;
    reply.editedAt = new Date();
    await reply.save();

    // Populate user info
    await Reply.populate(reply, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: 'Failed to update reply' },
      { status: 500 }
    );
  }
};

const handleDelete = async (request: NextRequest, context: ApiContext) => {
  try {
    // Verify user authentication and get token data
    const authData = await requireAuth();

    // Get reply ID and validate
    const { replyId } = context.params || {};
    if (!replyId || !mongoose.isValidObjectId(replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
        { status: 400 }
      );
    }

    // Find reply
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Check if post is locked
    const post = await Post.findById(reply.postId);
    if (post?.isLocked) {
      return NextResponse.json(
        { error: 'This thread is locked' },
        { status: 403 }
      );
    }

    // Convert auth data to UserWithoutPassword format
    const user = jwtToUser(authData);

    // Check permissions
    if (!canPerformAction('delete', user, reply.author.toString(), 'reply')) {
      return NextResponse.json(
        { error: 'Not authorized to delete this reply' },
        { status: 403 }
      );
    }

    // Delete reply
    await reply.deleteOne();

    // Decrement reply count on post
    await Post.findByIdAndUpdate(reply.postId, {
      $inc: { replyCount: -1 }
    });

    return NextResponse.json(
      { message: 'Reply deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
};

// Export the handlers with middleware
export const PATCH = withDb(handlePatch, { requireConnection: true });
export const DELETE = withDb(handleDelete, { requireConnection: true });

// Handle preflight requests
export const OPTIONS = handleOptions(['PATCH', 'DELETE', 'OPTIONS']);