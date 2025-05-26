import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_CONFIG, SECURITY_CONFIG } from '@/lib/auth/config';

// Edge-compatible correlation ID generation with better entropy
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random1}-${random2}`;
}

const { accessToken: ACCESS_TOKEN_CONFIG, refreshToken: REFRESH_TOKEN_CONFIG } = COOKIE_CONFIG;

// Token verification cache with improved typing
interface CacheEntry {
  payload: any;
  timestamp: number;
  validUntil: number;
  hitCount: number;
}

const tokenCache = new Map<string, CacheEntry>();

// Enhanced cache configuration
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 60 * 1000, // 1 minute
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
  maxEntries: 1000, // Prevent memory leaks
} as const;

// More efficient cache cleanup with LRU eviction
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(tokenCache.entries());
    
    // Remove expired entries
    const validEntries = entries.filter(([, value]) => value.validUntil >= now);
    
    // If still over limit, remove least recently used entries
    if (validEntries.length > CACHE_CONFIG.maxEntries) {
      validEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      validEntries.splice(CACHE_CONFIG.maxEntries);
    }
    
    // Rebuild cache
    tokenCache.clear();
    validEntries.forEach(([key, value]) => tokenCache.set(key, value));
  }, CACHE_CONFIG.cleanupInterval);
}

// Optimized route matchers using Sets for O(1) lookup
const STATIC_EXTENSIONS = new Set([
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', 
  '.woff', '.woff2', '.ttf', '.eot', '.map', '.json', '.xml', '.txt'
]);

const STATIC_PREFIXES = new Set([
  '/_next/', '/static/', '/images/', '/assets/', '/papers/', '/books/'
]);

const NODE_RUNTIME_ROUTES = new Set([
  '/api/auth/password/reset',
  '/api/auth/verify',
  '/api/auth/register',
  '/api/auth/login',
  '/api/email',
  '/api/flashcards'
]);

const PUBLIC_API_ENDPOINTS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/password/reset',
  '/api/auth/refresh',
  '/api/health',
  '/api/papers',
  '/api/subjects',
  '/api/marks'
]);

// Helper function to create login redirect URL
function createLoginUrl(request: NextRequest, returnTo: string): URL {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('returnTo', returnTo);
  return loginUrl;
}

// Enhanced token verification with better error handling
async function verifyToken(token: string, baseUrl: string, correlationId: string): Promise<any> {
  // Check cache first with hit counting
  const cached = tokenCache.get(token);
  const now = Date.now();

  if (cached) {
    cached.hitCount++;
    
    // Return cached result if still fresh
    if (cached.timestamp + CACHE_CONFIG.maxAge > now) {
      return cached.payload;
    }
    
    // Use stale data and revalidate in background if within grace period
    if (cached.timestamp + CACHE_CONFIG.maxAge + CACHE_CONFIG.staleWhileRevalidate > now) {
      // Non-blocking background revalidation
      setImmediate(async () => {
        try {
          const newPayload = await verifyTokenViaApi(token, baseUrl, correlationId);
          if (newPayload) {
            updateTokenCache(token, newPayload);
          } else {
            tokenCache.delete(token);
          }
        } catch (error) {
          console.warn(`Background token revalidation failed (${correlationId}):`, error);
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

// Improved API verification with timeout and retry logic
async function verifyTokenViaApi(token: string, baseUrl: string, correlationId: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`${baseUrl}/api/auth/verify-token`, {
      method: 'POST',
      body: token,
      headers: {
        'X-Correlation-ID': correlationId,
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.debug(`Token expired (${correlationId})`);
      } else {
        console.warn(`Token verification failed with status ${response.status} (${correlationId})`);
      }
      return null;
    }

    const data = await response.json();
    return data.valid ? data.payload : null;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn(`Token verification timeout (${correlationId})`);
    } else {
      console.error(`Token verification error (${correlationId}):`, error);
    }
    return null;
  }
}

// Enhanced cache update with better metadata
function updateTokenCache(token: string, payload: any): void {
  const now = Date.now();
  tokenCache.set(token, {
    payload,
    timestamp: now,
    validUntil: payload.exp ? payload.exp * 1000 : now + SECURITY_CONFIG.session.renewalThreshold * 1000,
    hitCount: 0
  });
}

// Optimized static path detection
function isStaticPath(pathname: string): boolean {
  // Check for file extensions
  const lastDot = pathname.lastIndexOf('.');
  if (lastDot > pathname.lastIndexOf('/')) {
    const extension = pathname.substring(lastDot);
    if (STATIC_EXTENSIONS.has(extension)) return true;
  }
  
  // Check for static prefixes
  for (const prefix of STATIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  
  // Special cases
  return pathname === '/favicon.ico' || 
         pathname.startsWith('/notes') ||
         pathname.startsWith('/subjects') ||
         pathname.startsWith('/search') ||
         pathname.startsWith('/tools');
}

// Check if route needs Node.js runtime
function needsNodeRuntime(pathname: string): boolean {
  return NODE_RUNTIME_ROUTES.has(pathname) || 
         Array.from(NODE_RUNTIME_ROUTES).some(route => pathname.startsWith(route));
}

// Check if API endpoint is public
function isPublicEndpoint(pathname: string): boolean {
  return PUBLIC_API_ENDPOINTS.has(pathname) ||
         Array.from(PUBLIC_API_ENDPOINTS).some(endpoint => pathname.startsWith(endpoint));
}

// Enhanced authentication check with better error handling
async function checkAuthentication(
  request: NextRequest, 
  correlationId: string
): Promise<{ isAuthenticated: boolean; isAdmin: boolean; payload?: any }> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_CONFIG.name);
  const refreshToken = request.cookies.get(REFRESH_TOKEN_CONFIG.name);
  
  if (!accessToken?.value && !refreshToken?.value) {
    return { isAuthenticated: false, isAdmin: false };
  }

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

  return {
    isAuthenticated: !!payload,
    isAdmin: payload?.role === 'admin',
    payload
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const correlationId = generateCorrelationId();

  // Skip middleware for static files - early return for performance
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Create base response with correlation ID
  const createResponse = (init?: ResponseInit) => {
    const response = NextResponse.next(init);
    response.headers.set('x-correlation-id', correlationId);
    return response;
  };

  // Add runtime header for Node.js routes
  if (needsNodeRuntime(pathname)) {
    const response = createResponse();
    response.headers.set('x-middleware-runtime', 'nodejs');
    return response;
  }

  // Handle admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const auth = await checkAuthentication(request, correlationId);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.redirect(createLoginUrl(request, pathname));
    }

    // Add caching headers for authenticated admin requests
    const response = createResponse();
    if (auth.payload?.exp) {
      const maxAge = Math.max(0, Math.floor((auth.payload.exp * 1000 - Date.now()) / 1000));
      response.headers.set('Cache-Control', `private, max-age=${maxAge}, stale-while-revalidate=60`);
      response.headers.set('ETag', `"${auth.payload.jti || correlationId}"`);
    }
    
    return response;
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Allow public endpoints
    if (isPublicEndpoint(pathname)) {
      return createResponse();
    }

    // Require authentication for protected API routes
    const auth = await checkAuthentication(request, correlationId);
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized', correlationId },
        { status: 401, headers: { 'x-correlation-id': correlationId } }
      );
    }
  }

  return createResponse();
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    '/api/admin/:path*',

    // Protected pages that require login
    '/profile/:path*',
    '/forum/new/:path*',

    // Auth routes that need protection (excluding public ones)
    '/api/auth/((?!login|register|password/reset|refresh).)*',

    // Protected API routes - all routes except health check
    '/api/((?!health).)*',
  ]
};