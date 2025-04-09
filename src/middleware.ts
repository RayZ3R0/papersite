import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Match cookie names with AuthCookieManager
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Skip middleware for static files and next internal routes
function isStaticPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Check for access token
    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY);
    // Check for refresh token as backup
    const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY);
    
    if (!accessToken?.value && !refreshToken?.value) {
      // No tokens at all - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Try to verify the access token first
      if (accessToken?.value) {
        const payload = await verifyToken(accessToken.value);
        if (payload) {
          // Valid access token, continue
          return NextResponse.next();
        }
      }

      // If access token is invalid and we have a refresh token,
      // let the request through - the client will handle refresh
      if (refreshToken?.value) {
        return NextResponse.next();
      }

      // No valid tokens - redirect to login
      throw new Error('No valid tokens');

    } catch (error) {
      // Invalid or expired tokens - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
  ],
};
