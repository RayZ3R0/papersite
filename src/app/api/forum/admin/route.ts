import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { Post } from '@/models/Post';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const handleAction = async (request: NextRequest) => {
  try {
    // Verify admin access
    await requireAdmin();

    // Get action details
    const body = await request.json();
    const { action, targetId } = body;

    if (!targetId || !mongoose.isValidObjectId(targetId)) {
      return NextResponse.json(
        { error: 'Invalid target ID' },
        { status: 400 }
      );
    }

    // Find target post
    const post = await Post.findById(targetId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'pin':
        post.isPinned = !post.isPinned;
        break;
      case 'lock':
        post.isLocked = !post.isLocked;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Save changes
    await post.save();

    return NextResponse.json({
      success: true,
      post: {
        id: post._id,
        isPinned: post.isPinned,
        isLocked: post.isLocked
      }
    });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const POST = withDb(handleAction);

// Handle CORS preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}