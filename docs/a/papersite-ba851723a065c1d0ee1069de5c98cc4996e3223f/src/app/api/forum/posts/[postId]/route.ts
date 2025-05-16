import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import { withDb, createErrorResponse, createSuccessResponse, isValidObjectId } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Maximum duration for operations
export const maxDuration = 10;

function getPostId(request: NextRequest): string | null {
  const segments = request.url.split('/');
  const postId = segments[segments.length - 1];
  return isValidObjectId(postId) ? postId : null;
}

export const GET = withDb(async (request: NextRequest) => {
  try {
    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    // Find post and populate user info
    const post = await Post.findById(postId)
      .populate('userInfo', 'username role verified')
      .lean()
      .exec();

    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    if (post.isDeleted) {
      return createErrorResponse('Post has been deleted', 410);
    }

    // Get replies for this post
    const replies = await Reply.find({ 
      postId,
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: 1 })
      .populate('userInfo', 'username role verified')
      .lean()
      .exec();

    // Format post with proper userInfo shape
    const formattedPost = {
      ...post,
      _id: post._id.toString(),
      author: post.author.toString(),
      createdAt: post.createdAt?.toISOString(),
      editedAt: post.editedAt?.toISOString(),
      lastReplyAt: post.lastReplyAt?.toISOString(),
      userInfo: post.userInfo ? {
        role: post.userInfo.role || 'user',
        verified: post.userInfo.verified || false
      } : undefined
    };

    // Format replies with proper userInfo shape
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
      post: formattedPost,
      replies: formattedReplies
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return createErrorResponse('Failed to fetch post');
  }
});

export const DELETE = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    // Check if user is author or admin
    const authorId = post.author.toString();
    if (authorId !== payload.userId && payload.role !== 'admin') {
      return createErrorResponse('Not authorized to delete this post', 403);
    }

    // Soft delete post and its replies
    const session = await Post.startSession();
    try {
      await session.withTransaction(async () => {
        post.isDeleted = true;
        post.deletedAt = new Date();
        post.deletedBy = payload.userId.toString();
        post.modifiedBy = {
          action: 'delete',
          user: payload.userId.toString(),
          timestamp: new Date()
        };
        await post.save({ session });

        // Mark replies as deleted
        await Reply.updateMany(
          { postId },
          { 
            $set: { 
              isDeleted: true,
              deletedAt: new Date(),
              deletedBy: payload.userId.toString()
            }
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return createSuccessResponse({
      message: 'Post and replies deleted successfully',
      postId: post._id.toString()
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return createErrorResponse('Failed to delete post');
  }
});

export const PATCH = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    const postId = getPostId(request);
    if (!postId) {
      return createErrorResponse('Invalid post ID', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    // Check if user is author or admin
    const authorId = post.author.toString();
    if (authorId !== payload.userId && payload.role !== 'admin') {
      return createErrorResponse('Not authorized to edit this post', 403);
    }

    const body = await request.json();
    const { title, content, tags } = body;

    if (!title && !content && !tags) {
      return createErrorResponse('No changes provided', 400);
    }

    // Update fields
    if (title) {
      if (title.length > 200) {
        return createErrorResponse('Title is too long (max 200 characters)', 400);
      }
      post.title = title.trim();
    }

    if (content) {
      if (content.length > 50000) {
        return createErrorResponse('Content is too long (max 50000 characters)', 400);
      }
      post.content = content.trim();
    }

    if (tags) {
      post.tags = tags.filter(Boolean);
    }

    post.edited = true;
    post.editedAt = new Date();
    post.modifiedBy = {
      action: 'edit',
      user: payload.userId.toString(),
      timestamp: new Date()
    };

    await post.save();

    // Populate and format response
    await Post.populate(post, {
      path: 'userInfo',
      select: 'username role verified'
    });

    const formattedPost = {
      ...post.toObject(),
      _id: post._id.toString(),
      author: post.author.toString(),
      createdAt: post.createdAt?.toISOString(),
      editedAt: post.editedAt?.toISOString(),
      lastReplyAt: post.lastReplyAt?.toISOString(),
      userInfo: post.userInfo ? {
        role: post.userInfo.role || 'user',
        verified: post.userInfo.verified || false
      } : undefined
    };

    return createSuccessResponse({
      message: 'Post updated successfully',
      post: formattedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return createErrorResponse('Failed to update post');
  }
});

// Handle preflight requests
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}