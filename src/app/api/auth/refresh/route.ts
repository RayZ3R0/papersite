import { NextResponse } from 'next/server';
import { refreshUserToken } from '@/lib/auth';
import { AuthCookieManager } from '@/lib/auth/cookies';
import { AuthError } from '@/lib/authTypes';

export async function POST() {
  try {
    const { refreshToken } = AuthCookieManager.getTokens();
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    const { user } = await refreshUserToken(refreshToken);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'SERVER_ERROR' ? 500 : 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}