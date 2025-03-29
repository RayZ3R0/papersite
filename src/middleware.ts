import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting (can be replaced with Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const WINDOW_SIZE = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = {
  posts: 5,    // 5 posts per hour
  replies: 20, // 20 replies per hour
};

function getRateLimitKey(ip: string, type: 'posts' | 'replies'): string {
  return `${ip}:${type}`;
}

function isRateLimited(ip: string, type: 'posts' | 'replies'): boolean {
  const key = getRateLimitKey(ip, type);
  const now = Date.now();
  const limit = rateLimit.get(key);

  // Clean up expired entries
  if (limit && now > limit.resetTime) {
    rateLimit.delete(key);
    return false;
  }

  if (!limit) {
    rateLimit.set(key, {
      count: 1,
      resetTime: now + WINDOW_SIZE,
    });
    return false;
  }

  if (limit.count >= MAX_REQUESTS[type]) {
    return true;
  }

  limit.count++;
  return false;
}

export async function middleware(request: NextRequest) {

    const pathname = request.nextUrl.pathname;

  // Redirect /subjects to /papers
  if (pathname.startsWith('/subjects')) {
    const newPathname = pathname.replace('/subjects', '/papers');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }
  
  // Only apply to forum API routes
  if (!request.nextUrl.pathname.startsWith('/api/forum')) {
    return NextResponse.next();
  }

  // Skip rate limiting for admin routes when admin token is present
  if (
    request.nextUrl.pathname.startsWith('/api/forum/admin') &&
    request.headers.get('X-Admin-Token') === process.env.ADMIN_TOKEN
  ) {
    return NextResponse.next();
  }

  const ip = request.ip || request.headers.get('x-real-ip') || '127.0.0.1';
  const requestType = request.nextUrl.pathname.includes('/posts/')
    ? 'replies'
    : 'posts';

  // Check rate limit
  if (
    request.method === 'POST' &&
    isRateLimited(ip, requestType)
  ) {
    return NextResponse.json(
      {
        error: `Too many ${requestType}. Please try again later.`,
      },
      { status: 429 }
    );
  }

  // Add IP to request headers for tracking
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Real-IP', ip);

  // Continue with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: '/api/forum/:path*',
};
