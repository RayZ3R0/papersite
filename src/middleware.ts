import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_CONFIG } from '@/lib/auth/config';

const { accessToken: ACCESS_TOKEN_CONFIG, refreshToken: REFRESH_TOKEN_CONFIG } = COOKIE_CONFIG;

// Helper function to create login redirect URL
function createLoginUrl(request: NextRequest, returnTo: string) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('returnTo', returnTo);
  return loginUrl;
}

// Helper function to verify token via API
async function verifyTokenViaApi(token: string, baseUrl: string) {
  try {
    const response = await fetch(`${baseUrl}/api/auth/verify-token`, {
      method: 'POST',
      body: token,
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.valid ? data.payload : null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Routes that require Node.js runtime
const NODE_RUNTIME_ROUTES = [
  '/api/auth/password/reset',
  '/api/auth/verify',
  '/api/auth/register',
  '/api/auth/login',
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
    pathname.startsWith('/tools') ||
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
    const accessToken = request.cookies.get(ACCESS_TOKEN_CONFIG.name);
    const refreshToken = request.cookies.get(REFRESH_TOKEN_CONFIG.name);
    
    // No tokens - redirect to login
    if (!accessToken?.value && !refreshToken?.value) {
      return NextResponse.redirect(createLoginUrl(request, pathname));
    }

    // Try to verify via API
    const baseUrl = request.nextUrl.origin;
    let payload = null;

    // Try access token first
    if (accessToken?.value) {
      payload = await verifyTokenViaApi(accessToken.value, baseUrl);
    }

    // Try refresh token if access token failed
    if (!payload && refreshToken?.value) {
      payload = await verifyTokenViaApi(refreshToken.value, baseUrl);
    }

    // Check if user is admin
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(createLoginUrl(request, pathname));
    }

    return NextResponse.next();
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
