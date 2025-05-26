import { NextResponse, type NextRequest } from 'next/server';
import { securityHeaders, getRouteHeaders } from '@/lib/security/headers';
import { rateLimit } from '@/lib/security/rateLimit';
import { createSecureResponse } from '@/lib/security/headers';

type CorsHeaders = {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Allow-Credentials': string;
  'Access-Control-Max-Age': string;
};

// Define paths that need different security configurations
const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
const API_PATHS = ['/api/user', '/api/profile'];
const PROFILE_PATHS = ['/profile'];

// Define route types for rate limiting
const RATE_LIMIT_ROUTES = {
  '/api/auth/login': 'login',
  '/api/auth/register': 'register',
  '/api/user/profile': 'profile'
} as const;

// Get allowed domains from environment
const ALLOWED_DOMAINS = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(',') || [];
const VERCEL_DOMAIN = process.env.NEXT_PUBLIC_VERCEL_DOMAIN;
const CUSTOM_DOMAIN = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN;

export const config = {
  matcher: [
    '/api/:path*',  // API routes
    '/profile/:path*', // Profile pages
    '/auth/:path*'  // Auth pages
  ]
};

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  
  // Always allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    return origin.startsWith('http://localhost:') || 
           origin === 'http://localhost' ||
           origin.startsWith('https://localhost:');
  }

  // Check if origin is in allowed list
  if (ALLOWED_DOMAINS.some(domain => origin.endsWith(domain))) {
    return true;
  }

  // Allow Vercel preview deployments
  if (origin.endsWith('.vercel.app')) {
    return true;
  }

  return false;
}

/**
 * Get CORS headers based on origin
 */
function getCorsHeaders(origin: string | null): Partial<CorsHeaders> {
  // In development, if no origin, allow localhost
  if (!origin && process.env.NODE_ENV === 'development') {
    return {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };
  }

  if (!isAllowedOrigin(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Determine route type from request path
 */
function getRouteType(path: string): 'auth' | 'api' | 'profile' {
  if (AUTH_PATHS.some(p => path.startsWith(p))) return 'auth';
  if (API_PATHS.some(p => path.startsWith(p))) return 'api';
  if (PROFILE_PATHS.some(p => path.startsWith(p))) return 'profile';
  return 'api';
}

/**
 * Get rate limit configuration for path
 */
function getRateLimitConfig(path: string) {
  const key = Object.entries(RATE_LIMIT_ROUTES).find(([route]) => path.startsWith(route));
  return key ? key[1] : 'default';
}

/**
 * Add correlation ID to request
 */
function addCorrelationId(request: NextRequest): string {
  const correlationId = crypto.randomUUID();
  const headers = new Headers(request.headers);
  headers.set('x-correlation-id', correlationId);
  return correlationId;
}

/**
 * Log request details in development
 */
function logRequest(request: NextRequest, correlationId: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${correlationId}] ${request.method} ${request.url}`, {
      headers: Object.fromEntries(request.headers.entries()),
      ip: request.ip,
      geo: request.geo,
    });
  }
}

/**
 * Add headers to response
 */
function addHeaders(
  response: NextResponse,
  headers: Record<string, string | undefined>
) {
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
}

/**
 * Handle preflight requests
 */
function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  const corsHeaders = getCorsHeaders(origin);
  const securityHeadersForRoute = getRouteHeaders('api');
  
  addHeaders(response, {
    ...corsHeaders,
    ...securityHeadersForRoute
  });
  
  return response;
}

/**
 * Middleware handler
 */
export default async function middleware(request: NextRequest) {
  try {
    // Handle CORS preflight
    const preflightResponse = handlePreflight(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Add correlation ID
    const correlationId = addCorrelationId(request);
    
    // Log request in development
    logRequest(request, correlationId);

    // Check origin for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const origin = request.headers.get('origin');
      // In development, allow requests without origin
      if (!origin && process.env.NODE_ENV === 'development') {
        // Continue processing
      } else if (!isAllowedOrigin(origin)) {
        return createSecureResponse(
          { error: 'Invalid origin' },
          403,
          'api'
        );
      }
    }

    // Determine route type
    const routeType = getRouteType(request.nextUrl.pathname);
    
    // Get appropriate headers
    const corsHeaders = getCorsHeaders(request.headers.get('origin'));
    const securityHeadersForRoute = getRouteHeaders(routeType);

    // Create base response
    const response = NextResponse.next({
      request: {
        headers: new Headers(request.headers)
      }
    });

    // Add all headers
    addHeaders(response, {
      ...corsHeaders,
      ...securityHeadersForRoute
    });

    // Check rate limits for API routes
    if (routeType === 'api' || routeType === 'auth') {
      const rateLimitType = getRateLimitConfig(request.nextUrl.pathname);
      const rateLimitResult = await rateLimit(request, rateLimitType);

      if (!rateLimitResult.success) {
        return rateLimitResult.response;
      }

      // Add rate limit headers if they exist
      if (rateLimitResult.headers) {
        addHeaders(response, rateLimitResult.headers);
      }
    }

    // Add correlation ID to response
    response.headers.set('x-correlation-id', correlationId);

    return response;

  } catch (error) {
    console.error('Middleware error:', error);

    // Return error response with security headers
    return createSecureResponse(
      { error: 'Internal server error' },
      500,
      'api'
    );
  }
}
