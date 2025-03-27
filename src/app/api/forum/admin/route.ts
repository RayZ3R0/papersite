import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import { validateAdminToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Admin delete post
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const token = request.headers.get('X-Admin-Token');

    // Validate admin token
    try {
      validateAdminToken(token || undefined);
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate post ID
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Delete post and its replies
    await Reply.deleteMany({ postId });
    const result = await Post.findByIdAndDelete(postId);

    if (!result) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Post and replies deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

// Admin delete reply
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get('replyId');
    const token = request.headers.get('X-Admin-Token');

    // Validate admin token
    try {
      validateAdminToken(token || undefined);
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate reply ID
    if (!replyId || !mongoose.Types.ObjectId.isValid(replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await Reply.findByIdAndDelete(replyId);

    if (!result) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Update post reply count
    await Post.findByIdAndUpdate(result.postId, {
      $inc: { replyCount: -1 }
    });

    return NextResponse.json(
      { message: 'Reply deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin delete reply error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
}