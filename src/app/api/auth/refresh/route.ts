import { NextRequest, NextResponse } from 'next/server';
import { AuthCookieManager, refreshUserToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = AuthCookieManager.getTokens();
    
    // If no refresh token in cookies, can't refresh
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }
    
    // Attempt to refresh
    const result = await refreshUserToken(refreshToken);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}