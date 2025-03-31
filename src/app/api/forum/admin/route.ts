import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/validation';
import { withDb, handleOptions, createErrorResponse } from '@/lib/api-middleware';
import { Post } from '@/models/Post';
import mongoose from 'mongoose';

// Make route dynamic
export const dynamic = 'force-dynamic';

function isValidId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify admin role
    await requireRole(['admin']);

    // During build, return mock response
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        message: 'Mock admin action successful'
      });
    }

    const body = await request.json();
    const { action, targetId } = body;

    if (!targetId || !isValidId(targetId)) {
      return createErrorResponse('Invalid target ID', 400);
    }

    switch (action) {
      case 'pin': {
        const post = await Post.findById(targetId);
        if (!post) return createErrorResponse('Post not found', 404);
        
        post.isPinned = !post.isPinned;
        await post.save();

        return NextResponse.json({
          success: true,
          message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
          post
        });
      }

      case 'lock': {
        const post = await Post.findById(targetId);
        if (!post) return createErrorResponse('Post not found', 404);
        
        post.isLocked = !post.isLocked;
        await post.save();

        return NextResponse.json({
          success: true,
          message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
          post
        });
      }

      case 'delete': {
        const post = await Post.findById(targetId);
        if (!post) return createErrorResponse('Post not found', 404);
        
        await post.deleteOne();

        return NextResponse.json({
          success: true,
          message: 'Post deleted successfully'
        });
      }

      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Admin action error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Admin action failed',
      error instanceof Error && error.name === 'AuthError' ? 401 : 500
    );
  }
}, { requireConnection: true });

// Handle preflight requests
export async function OPTIONS() {
  return handleOptions(['POST', 'OPTIONS']);
}