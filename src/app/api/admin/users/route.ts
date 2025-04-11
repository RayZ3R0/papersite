import { NextRequest, NextResponse } from 'next/server';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/auth/validation';
import { verifyAccessToken } from '@/lib/auth/edge';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Maximum duration for admin operations
export const maxDuration = 10;

export const GET = withDb(async (req: NextRequest) => {
  try {
    // Verify admin access
    const payload = await requireAuth();
    if (payload.role !== 'admin') {
      return createErrorResponse('Unauthorized', 403);
    }

    const users = await User.find({}, {
      username: 1,
      email: 1,
      role: 1,
      banned: 1,
      verified: 1,
      createdAt: 1,
      lastLogin: 1,
      loginCount: 1,
      verificationAttempts: 1,
      resetPasswordAttempts: 1,
      lockoutUntil: 1
    }).sort({ createdAt: -1 });

    return createSuccessResponse({ 
      users: users.map(user => ({
        ...user.toObject(),
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
        lockoutUntil: user.lockoutUntil?.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return createErrorResponse('Failed to fetch users', 500);
  }
});

export const DELETE = withDb(async (req: NextRequest) => {
  try {
    // Verify admin access
    const payload = await requireAuth();
    if (payload.role !== 'admin') {
      return createErrorResponse('Unauthorized', 403);
    }

    const { userId } = await req.json();

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Don't allow admin to delete themselves
    if (payload.userId === userId) {
      return createErrorResponse('Cannot delete your own account', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return createErrorResponse('Cannot delete admin users', 400);
    }

    await User.findByIdAndDelete(userId);

    return createSuccessResponse({ 
      message: 'User deleted successfully',
      userId: userId.toString()
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return createErrorResponse('Failed to delete user', 500);
  }
});

// Handle preflight requests
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};