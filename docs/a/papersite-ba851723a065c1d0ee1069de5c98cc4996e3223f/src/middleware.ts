import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_CONFIG } from '@/lib/auth/config';

const { accessToken: ACCESS_TOKEN_CONFIG, refreshToken: REFRESH_TOKEN_CONFIG } = COOKIE_CONFIG;

// Routes that require Node.js runtime
const NODE_RUNTIME_ROUTES = [
  '/api/auth/password/reset',
  '/api/auth/verify',
  '/api/email'
];

// Skip middleware for static files, public assets, and next internal routes
function isStaticPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.') ||
    pathname.includes('/papers/') ||
    pathname.includes('/books/') ||
    pathname.startsWith('/papers') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/subjects') ||
    pathname.startsWith('/search') ||
    pathname === '/favicon.ico'
  );
}

// Check if route needs Node.js runtime
function needsNodeRuntime(pathname: string) {
  return NODE_RUNTIME_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Add runtime header for Node.js routes
  if (needsNodeRuntime(pathname)) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-runtime', 'nodejs');
    return response;
  }

  // Handle admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Get tokens from cookies
    const accessToken = request.cookies.get(ACCESS_TOKEN_CONFIG.name);
    const refreshToken = request.cookies.get(REFRESH_TOKEN_CONFIG.name);
    
    // No tokens - redirect to login
    if (!accessToken?.value && !refreshToken?.value) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      let isValid = false;

      // Try access token first
      if (accessToken?.value) {
        const payload = await verifyToken(accessToken.value);
        isValid = payload?.role === 'admin';
      }

      // Try refresh token if access token is invalid
      if (!isValid && refreshToken?.value) {
        const payload = await verifyToken(refreshToken.value);
        isValid = payload?.role === 'admin';
      }

      if (!isValid) {
        throw new Error('Insufficient permissions');
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid tokens - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle other protected routes
  if (pathname.startsWith('/api/')) {
    const accessToken = request.cookies.get(ACCESS_TOKEN_CONFIG.name);
    const refreshToken = request.cookies.get(REFRESH_TOKEN_CONFIG.name);

    // Allow refresh token endpoint without auth
    if (pathname === '/api/auth/refresh') {
      return NextResponse.next();
    }

    // Public endpoints
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/password/reset',
      '/api/health'
    ];
    
    if (publicEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
      return NextResponse.next();
    }

    // Require auth for other API routes
    if (!accessToken?.value && !refreshToken?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // Continue with request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    '/api/admin/:path*',

    // Protected pages that require login
    '/profile/:path*',
    '/forum/new/:path*',
    '/annotate/:path*',

    // Auth routes that need protection
    '/api/auth/((?!login|register|password/reset).)*',

    // Protected API routes
    '/api/((?!health|subjects|books|papers).)*',
  ]
};
