import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Get token from cookie
  const authCookie = request.cookies.get('auth_token');

  // Get request path
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!authCookie?.value) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const payload = await verifyToken(authCookie.value);
      
      // Check for admin role
      if (payload.role !== 'admin') {
        // Redirect non-admins to home page
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Invalid or expired token
      return NextResponse.redirect(new URL('/auth/login', request.url));
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
