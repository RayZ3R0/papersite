import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { Post } from '@/models/Post';
import { canPerformAction } from '@/lib/forumUtils';
import { UserTokenPayload, UserWithoutPassword, jwtToUser } from '@/lib/authTypes';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const handleGet = async (request: NextRequest, context: { params?: { postId?: string } }) => {
  try {
    // Verify user authentication
    await requireAuth();

    const { postId } = context.params || {};
    if (!postId || !mongoose.isValidObjectId(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId)
      .populate('userInfo', 'username role verified');

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
};

const handlePatch = async (request: NextRequest, context: { params?: { postId?: string } }) => {
  try {
    // Verify user authentication
    const authData = await requireAuth();

    const { postId } = context.params || {};
    if (!postId || !mongoose.isValidObjectId(postId)) {
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

    // Convert auth data to UserWithoutPassword format
    const user = jwtToUser(authData);

    if (!canPerformAction('edit', user, post.author.toString(), 'post')) {
      return NextResponse.json(
        { error: 'Not authorized to edit this post' },
        { status: 403 }
      );
    }

    // Get and validate content
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Update post
    post.title = title;
    post.content = content;
    post.edited = true;
    post.editedAt = new Date();
    await post.save();

    // Populate user info
    await Post.populate(post, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
};

const handleDelete = async (request: NextRequest, context: { params?: { postId?: string } }) => {
  try {
    // Verify user authentication
    const authData = await requireAuth();

    const { postId } = context.params || {};
    if (!postId || !mongoose.isValidObjectId(postId)) {
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

    // Convert auth data to UserWithoutPassword format
    const user = jwtToUser(authData);

    if (!canPerformAction('delete', user, post.author.toString(), 'post')) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    await post.deleteOne();

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const GET = withDb(handleGet, { requireConnection: false });
export const PATCH = withDb(handlePatch, { requireConnection: true });
export const DELETE = withDb(handleDelete, { requireConnection: true });

// Handle CORS preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}