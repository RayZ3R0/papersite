import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from '@/lib/authTypes';
import { refreshUserToken, getTokensFromCookies } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const handleRefresh = async (request: NextRequest) => {
  try {
    // Get refresh token from cookies
    const { refreshToken } = await getTokensFromCookies();
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // Try to refresh the token
    const result = await refreshUserToken(refreshToken);

    // Set new auth cookie
    const cookieStore = cookies();
    cookieStore.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(result.expiresAt * 1000)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'UNAUTHORIZED' ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const POST = withDb(handleRefresh);

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