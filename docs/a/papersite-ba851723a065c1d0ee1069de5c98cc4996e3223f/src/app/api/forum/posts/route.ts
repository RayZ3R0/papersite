import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/models/Post';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';
import { MongoError, ValidationError } from '@/types/registration';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Maximum duration for forum operations
export const maxDuration = 10;

export const GET = withDb(async (request: NextRequest) => {
  try {
    const posts = await Post.find(
      { isDeleted: { $ne: true } },
      'title content username tags replyCount createdAt isPinned isLocked'
    )
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    // Format post data
    const formattedPosts = posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      username: post.username,
      tags: post.tags || [],
      replyCount: post.replyCount || 0,
      createdAt: post.createdAt?.toISOString(),
      isPinned: post.isPinned || false,
      isLocked: post.isLocked || false
    }));

    return createSuccessResponse({
      posts: formattedPosts,
      total: formattedPosts.length
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return createErrorResponse('Failed to fetch posts');
  }
});

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const body = await request.json();
    const { title, content, tags } = body;

    if (!title?.trim() || !content?.trim()) {
      return createErrorResponse('Title and content are required', 400);
    }

    if (title.length > 200) {
      return createErrorResponse('Title is too long (max 200 characters)', 400);
    }

    if (content.length > 50000) {
      return createErrorResponse('Content is too long (max 50000 characters)', 400);
    }

    // Create and save post
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: payload.userId,
      username: payload.username,
      tags: tags?.filter(Boolean) || [],
      createdAt: new Date()
    });

    // Populate user info
    await Post.populate(post, {
      path: 'userInfo',
      select: 'username role verified'
    });

    // Format response data
    const formattedPost = {
      ...post.toObject(),
      _id: post._id.toString(),
      author: post.author.toString(),
      createdAt: post.createdAt?.toISOString()
    };

    return createSuccessResponse({
      message: 'Post created successfully',
      post: formattedPost
    }, 201);
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    
    if (error && (error as ValidationError).name === 'ValidationError') {
      const validationError = error as ValidationError;
      const messages = Object.values(validationError.errors)
        .map(err => err.message)
        .join(', ');
      return createErrorResponse(`Validation failed: ${messages}`, 400);
    }

    if (error && (error as MongoError).code === 11000) {
      return createErrorResponse('Duplicate post detected', 409);
    }
    
    return createErrorResponse('Failed to create post');
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