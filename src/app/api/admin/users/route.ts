import { NextRequest, NextResponse } from 'next/server';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';

export const GET = withDb(async (req: NextRequest) => {
  try {
    // Get auth token from cookie
    const authCookie = req.cookies.get('auth_token');
    if (!authCookie?.value) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Verify token and check role
    const payload = await verifyToken(authCookie.value);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Unauthorized', 403);
    }

    const users = await User.find({}, {
      username: 1,
      email: 1,
      role: 1,
      banned: 1,
      verified: 1,
      createdAt: 1,
      lastLogin: 1
    }).sort({ createdAt: -1 });

    return createSuccessResponse({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return createErrorResponse('Failed to fetch users', 500);
  }
});

export const DELETE = withDb(async (req: NextRequest) => {
  try {
    // Get auth token from cookie
    const authCookie = req.cookies.get('auth_token');
    if (!authCookie?.value) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Verify token and check role
    const payload = await verifyToken(authCookie.value);
    if (!payload || payload.role !== 'admin') {
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

    return createSuccessResponse({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return createErrorResponse('Failed to delete user', 500);
  }
});