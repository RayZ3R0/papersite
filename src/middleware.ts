import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_CONFIG, SECURITY_CONFIG } from '@/lib/auth/config';

// Edge-compatible correlation ID generation
function generateCorrelationId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

const { accessToken: ACCESS_TOKEN_CONFIG, refreshToken: REFRESH_TOKEN_CONFIG } = COOKIE_CONFIG;

// Token verification cache using Edge Runtime compatible storage
const tokenCache = new Map<string, {
  payload: any;
  timestamp: number;
  validUntil: number;
}>();

// Cache settings
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 60 * 1000, // 1 minute
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
};

// Periodic cache cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokenCache.entries()) {
      if (value.validUntil < now) {
        tokenCache.delete(key);
      }
    }
  }, CACHE_CONFIG.cleanupInterval);
}

// Helper function to create login redirect URL
function createLoginUrl(request: NextRequest, returnTo: string) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('returnTo', returnTo);
  return loginUrl;
}

// Helper function to verify token with caching
async function verifyToken(token: string, baseUrl: string, correlationId: string) {
  // Add a fast path for initial page load
  if (typeof sessionStorage !== 'undefined') {
    const cachedPayload = sessionStorage.getItem(`token-payload-${token.slice(0,10)}`);
    if (cachedPayload) {
      try {
        const payload = JSON.parse(cachedPayload);
        if (payload.exp * 1000 > Date.now()) {
          return payload;
        }
      } catch (e) {
        // Ignore parse errors, continue with normal flow
      }
    }
  }

  // Log cache stats periodically
  if (Math.random() < 0.01) { // 1% sampling
    console.debug(`Token cache stats (${correlationId}):`, {
      size: tokenCache.size,
      hitRate: tokenCache.size > 0 ?
        Array.from(tokenCache.values()).filter(v => v.timestamp + CACHE_CONFIG.maxAge > Date.now()).length / tokenCache.size : 0
    });
  }
  // Check cache first
  const cached = tokenCache.get(token);
  const now = Date.now();

  if (cached) {
    // Return cached result if still fresh
    if (cached.timestamp + CACHE_CONFIG.maxAge > now) {
      return cached.payload;
    }
    
    // Use stale data and revalidate in background if within grace period
    if (cached.timestamp + CACHE_CONFIG.maxAge + CACHE_CONFIG.staleWhileRevalidate > now) {
      // Trigger background revalidation
      verifyTokenViaApi(token, baseUrl, correlationId).then(newPayload => {
        if (newPayload) {
          updateTokenCache(token, newPayload);
        } else {
          tokenCache.delete(token);
        }
      });
      return cached.payload;
    }
  }

  // No cache or stale data - do fresh verification
  const payload = await verifyTokenViaApi(token, baseUrl, correlationId);
  if (payload) {
    updateTokenCache(token, payload);
  }
  return payload;
}

// Helper function for actual API verification
async function verifyTokenViaApi(token: string, baseUrl: string, correlationId: string) {
  console.debug(`Token verification attempt (${correlationId}):`, {
    tokenStart: token.slice(0, 10) + '...',
    timestamp: new Date().toISOString()
  });
  try {
    const response = await fetch(`${baseUrl}/api/auth/verify-token`, {
      method: 'POST',
      body: token,
      headers: {
        'X-Correlation-ID': correlationId,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
      }
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.valid ? data.payload : null;
  } catch (error) {
    console.error(`Token verification error (${correlationId}):`, error);
    return null;
  }
}

// Helper function to update token cache
function updateTokenCache(token: string, payload: any) {
  const now = Date.now();
  tokenCache.set(token, {
    payload,
    timestamp: now,
    validUntil: now + SECURITY_CONFIG.session.renewalThreshold * 1000
  });
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
  const correlationId = generateCorrelationId();

  // Skip middleware for static files
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Add runtime and correlation headers for Node.js routes
  if (needsNodeRuntime(pathname)) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-runtime', 'nodejs');
    response.headers.set('x-correlation-id', correlationId);
    return response;
  }

  // Add correlation ID to all responses
  const response = NextResponse.next();
  response.headers.set('x-correlation-id', correlationId);

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
      payload = await verifyToken(accessToken.value, baseUrl, correlationId);
    }

    // Try refresh token if access token failed
    if (!payload && refreshToken?.value) {
      payload = await verifyToken(refreshToken.value, baseUrl, correlationId);
    }

    // Add caching headers to response if successful
    if (payload) {
      const expiryTime = payload.exp * 1000;
      const maxAge = Math.floor((expiryTime - Date.now()) / 1000);
      response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=60`);
      response.headers.set('ETag', `"${payload.jti || correlationId}"`);
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

    // Auth routes that need protection
    '/api/auth/((?!login|register|password/reset).)*',

    // Protected API routes
    '/api/((?!health|subjects|books|papers).)*',
  ]
};
