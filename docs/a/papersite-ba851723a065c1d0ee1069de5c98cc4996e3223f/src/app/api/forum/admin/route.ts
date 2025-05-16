import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/validation';
import { withDb, handleOptions, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { Post } from '@/models/Post';
import mongoose from 'mongoose';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Set maximum duration for admin operations
export const maxDuration = 10;

function isValidId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify admin role
    await requireRole(['admin', 'moderator']); // Allow moderators too

    const body = await request.json();
    const { action, targetId } = body;

    if (!targetId || !isValidId(targetId)) {
      return createErrorResponse('Invalid target ID', 400);
    }

    const post = await Post.findById(targetId);
    if (!post) {
      return createErrorResponse('Post not found', 404);
    }

    // Track action metadata
    const actionMetadata = {
      performedAt: new Date(),
      performedBy: request.headers.get('X-User-Id') || 'unknown'
    };

    switch (action) {
      case 'pin': {
        post.isPinned = !post.isPinned;
        post.modifiedBy = {
          ...actionMetadata,
          action: 'pin',
          previousState: !post.isPinned
        };
        await post.save();

        return createSuccessResponse({
          message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
          post: {
            ...post.toObject(),
            _id: post._id.toString(),
            createdAt: post.createdAt?.toISOString(),
            updatedAt: post.updatedAt?.toISOString()
          }
        });
      }

      case 'lock': {
        post.isLocked = !post.isLocked;
        post.modifiedBy = {
          ...actionMetadata,
          action: 'lock',
          previousState: !post.isLocked
        };
        await post.save();

        return createSuccessResponse({
          message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
          post: {
            ...post.toObject(),
            _id: post._id.toString(),
            createdAt: post.createdAt?.toISOString(),
            updatedAt: post.updatedAt?.toISOString()
          }
        });
      }

      case 'delete': {
        // Soft delete by default
        post.isDeleted = true;
        post.deletedAt = new Date();
        post.deletedBy = actionMetadata.performedBy;
        await post.save();

        return createSuccessResponse({
          message: 'Post deleted successfully',
          postId: post._id.toString()
        });
      }

      case 'restore': {
        if (!post.isDeleted) {
          return createErrorResponse('Post is not deleted', 400);
        }

        post.isDeleted = false;
        post.deletedAt = undefined;
        post.deletedBy = undefined;
        await post.save();

        return createSuccessResponse({
          message: 'Post restored successfully',
          post: {
            ...post.toObject(),
            _id: post._id.toString(),
            createdAt: post.createdAt?.toISOString(),
            updatedAt: post.updatedAt?.toISOString()
          }
        });
      }

      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Admin action error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Admin action failed',
      error instanceof Error && error.name === 'AuthError' ? 403 : 500
    );
  }
}, { requireConnection: true });

// Handle preflight requests
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
      'Access-Control-Max-Age': '86400'
    }
  });
};