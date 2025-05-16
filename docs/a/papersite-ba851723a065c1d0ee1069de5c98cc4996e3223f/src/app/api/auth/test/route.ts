import { NextRequest, NextResponse } from 'next/server';
import { AuthCookieManager } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = AuthCookieManager.getTokens();
    
    const response: any = {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      tokenData: null,
      cookieDetails: {
        accessToken: {
          exists: !!request.cookies.get('access_token'),
          isHttpOnly: true
        },
        refreshToken: {
          exists: !!request.cookies.get('refresh_token'),
          isHttpOnly: true
        }
      }
    };

    if (accessToken) {
      try {
        const tokenData = await verifyToken(accessToken);
        response.tokenData = {
          userId: tokenData.userId,
          username: tokenData.username,
          role: tokenData.role,
          exp: tokenData.exp,
          iat: tokenData.iat
        };
      } catch (error) {
        response.tokenError = 'Invalid or expired access token';
      }
    }

    // Add headers from the request for debugging
    response.headers = {};
    request.headers.forEach((value, key) => {
      response.headers[key] = value;
    });

    // Add cookie details
    response.cookies = {};
    request.cookies.getAll().forEach(cookie => {
      // Only show if cookie exists and redact sensitive values
      response.cookies[cookie.name] = {
        exists: true,
        value: cookie.name.includes('token') ? '[REDACTED]' : cookie.value
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Auth test failed' },
      { status: 500 }
    );
  }
}