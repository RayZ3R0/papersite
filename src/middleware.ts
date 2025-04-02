import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { AuthCookieManager } from '@/lib/auth/cookies';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/api/forum/posts',
  '/api/forum/replies',
  '/api/annotate',
  '/api/notes',
];

// Paths that don't need token refresh check
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Set security headers
  const response = NextResponse.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Updated CSP to include 'unsafe-eval' for Next.js development
  const isDev = process.env.NODE_ENV === 'development';
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`
  );

  // Check if path requires authentication
  const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  if (!requiresAuth) {
    return response;
  }

  // Get tokens from cookies
  const { accessToken, refreshToken } = AuthCookieManager.getTokens();

  // If no tokens, deny access
  if (!accessToken || !refreshToken) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verify access token
  const payload = await verifyToken(accessToken);

  // If access token is valid, continue
  if (payload) {
    return response;
  }

  // If access token is invalid, try refresh
  try {
    const refreshResponse = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': `refresh_token=${refreshToken}`,
      },
    });

    if (!refreshResponse.ok) {
      // If refresh fails, clear cookies and deny access
      AuthCookieManager.clearTokens();
      return new NextResponse(
        JSON.stringify({ error: 'Session expired' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the new access token from refresh response cookies
    const setCookieHeader = refreshResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      throw new Error('No cookies in refresh response');
    }

    // Forward the new cookies and continue
    response.headers.set('Set-Cookie', setCookieHeader);
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Configure middleware to run only on API routes
export const config = {
  matcher: [
    '/api/:path*', // Only match API routes
  ],
};
