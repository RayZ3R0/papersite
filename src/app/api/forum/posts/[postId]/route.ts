import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import { withDb, handleOptions } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import mongoose from 'mongoose';

export const GET = withDb(async (request: NextRequest) => {
  try {
    const postId = request.url.split('/').pop();
    if (!mongoose.isValidObjectId(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get replies for this post
    const replies = await Reply.find({ postId });

    return NextResponse.json({ post, replies });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
});

export const DELETE = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const postId = request.url.split('/').pop();
    if (!mongoose.isValidObjectId(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (post.author.toString() !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    // Delete all replies to this post
    await Reply.deleteMany({ postId });

    // Delete the post
    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Post and replies deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
});

export const PATCH = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const postId = request.url.split('/').pop();
    if (!mongoose.isValidObjectId(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (post.author.toString() !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to edit this post' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title && !content) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    // Update only provided fields
    if (title) post.title = title;
    if (content) post.content = content;
    post.edited = true;
    post.editedAt = new Date();

    await post.save();

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'DELETE', 'PATCH', 'OPTIONS']);