import { NextRequest, NextResponse } from 'next/server';
import { Reply } from '@/models/Reply';
import { withDb, handleOptions } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import mongoose from 'mongoose';

export const GET = withDb(async (request: NextRequest) => {
  try {
    const replyId = request.url.split('/').pop();
    if (!mongoose.isValidObjectId(replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
        { status: 400 }
      );
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error fetching reply:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reply' },
      { status: 500 }
    );
  }
});

export const DELETE = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const replyId = request.url.split('/').pop();
    if (!mongoose.isValidObjectId(replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
        { status: 400 }
      );
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (reply.author.toString() !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this reply' },
        { status: 403 }
      );
    }

    await reply.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
});

export const PATCH = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const replyId = request.url.split('/').pop();
    if (!mongoose.isValidObjectId(replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
        { status: 400 }
      );
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (reply.author.toString() !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to edit this reply' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    reply.content = content;
    reply.edited = true;
    reply.editedAt = new Date();

    await reply.save();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: 'Failed to update reply' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'DELETE', 'PATCH', 'OPTIONS']);