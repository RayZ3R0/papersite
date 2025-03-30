import { NextRequest, NextResponse } from 'next/server';
import { refreshUserToken } from '@/lib/auth';
import { AuthCookieManager } from '@/lib/auth/cookies';
import { AuthError } from '@/lib/authTypes';
import { withDb, handleOptions } from '@/lib/api-middleware';

export const POST = withDb(async (request: NextRequest) => {
  try {
    const { refreshToken } = AuthCookieManager.getTokens();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    const result = await refreshUserToken(refreshToken);

    // Clear cookies if token refresh fails
    if (!result) {
      AuthCookieManager.clearTokens();
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);

    // Handle known auth errors
    if (error instanceof AuthError) {
      // Always clear cookies on token errors
      if (error.type === 'INVALID_TOKEN' || error.type === 'UNAUTHORIZED') {
        AuthCookieManager.clearTokens();
      }

      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'SERVER_ERROR' ? 500 : 401 }
      );
    }

    // Handle unexpected errors
    AuthCookieManager.clearTokens();
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['POST', 'OPTIONS']);