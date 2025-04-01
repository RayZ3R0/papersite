import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from '@/lib/authTypes';
import { requireAuth } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

const handleGetMe = async (request: NextRequest) => {
  try {
    // Get authenticated user
    const authUser = await requireAuth();

    // Get full user data
    const user = await User.findById(authUser.userId)
      .select('-password -refreshToken');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'UNAUTHORIZED' ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const GET = withDb(handleGetMe);

// Handle CORS preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}