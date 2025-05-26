import { NextResponse } from 'next/server';

type SecurityHeadersType = {
  'Strict-Transport-Security': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Content-Security-Policy': string;
  'Permissions-Policy': string;
  'Referrer-Policy': string;
  'Cache-Control': string;
  'Access-Control-Allow-Methods'?: string;
  'Access-Control-Allow-Headers'?: string;
  'Access-Control-Max-Age'?: string;
  'Pragma'?: string;
};

/**
 * Security headers configuration
 */
export const securityHeaders: SecurityHeadersType = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "script-src 'self' 'unsafe-inline'", // Required for Next.js
    "style-src 'self' 'unsafe-inline'",  // Required for Next.js
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(', '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, max-age=0',
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  return response;
}

/**
 * Generate headers for specific routes
 */
export function getRouteHeaders(route: 'auth' | 'api' | 'profile'): SecurityHeadersType {
  const headers: SecurityHeadersType = { ...securityHeaders };

  switch (route) {
    case 'auth':
      // Add stricter CSP for auth pages
      headers['Content-Security-Policy'] = headers['Content-Security-Policy']
        .replace(
          "script-src 'self' 'unsafe-inline'",
          "script-src 'self'"
        );
      headers['Cache-Control'] = 'no-store, max-age=0';
      break;

    case 'api':
      // Add CORS headers for API routes
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      headers['Access-Control-Max-Age'] = '86400'; // 24 hours
      break;

    case 'profile':
      // Add cache control for profile pages
      headers['Cache-Control'] = 'no-store, max-age=0, private, no-cache';
      headers['Pragma'] = 'no-cache';
      break;
  }

  return headers;
}

/**
 * Create response with security headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  route?: 'auth' | 'api' | 'profile'
): NextResponse {
  const response = NextResponse.json(data, { status });
  const headers = route ? getRouteHeaders(route) : securityHeaders;

  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}