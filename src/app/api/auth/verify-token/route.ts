import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { headers } from 'next/headers';
import { COOKIE_CONFIG, SECURITY_CONFIG } from '@/lib/auth/config';

const { accessToken: ACCESS_TOKEN_CONFIG } = COOKIE_CONFIG;

// Cache settings aligned with middleware
const CACHE_CONFIG = {
  defaultMaxAge: 5 * 60, // 5 minutes
  staleWhileRevalidate: 60, // 1 minute
};

// Global request counter with type safety
declare global {
  var activeVerifications: number;
}

if (typeof global.activeVerifications === 'undefined') {
  global.activeVerifications = 0;
}

// Add proper cache control headers
function addCacheHeaders(response: NextResponse, expiryTime?: number) {
  const maxAge = expiryTime
    ? Math.floor((expiryTime * 1000 - Date.now()) / 1000)
    : CACHE_CONFIG.defaultMaxAge;

  response.headers.set('Cache-Control',
    `public, max-age=${maxAge}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidate}`
  );
  
  // Generate ETag based on response data
  const etag = `W/"${Date.now().toString(36)}"`;
  response.headers.set('ETag', etag);
  
  return response;
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const headersList = headers();
  const correlationId = headersList.get('x-correlation-id') || Date.now().toString(36);
  const requestStart = Date.now();

  // Track concurrent verification requests
  const concurrentRequests = global.activeVerifications;
  global.activeVerifications = concurrentRequests + 1;

  try {
    const token = await request.text();
    
    // Check if we can return 304 Not Modified
    const ifNoneMatch = headersList.get('if-none-match');
    if (ifNoneMatch) {
      const response = NextResponse.json(null, { status: 304 });
      response.headers.set('x-correlation-id', correlationId);
      return response;
    }
    
    if (!token) {
      const response = NextResponse.json(
        { error: 'No token provided', correlationId },
        { status: 401 }
      );
      response.headers.set('x-correlation-id', correlationId);
      return response;
    }

    // Verify token and get payload
    const payload = await verifyToken(token);

    // Calculate response
    const response = NextResponse.json({
      valid: true,
      payload: {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
        exp: payload.exp
      },
      correlationId
    });

    // Add cache headers based on token expiry
    addCacheHeaders(response, payload.exp);
    response.headers.set('x-correlation-id', correlationId);
    
    const verificationDuration = Date.now() - requestStart;
    console.debug(`Token verification success (${correlationId}):`, {
      duration: verificationDuration,
      concurrentRequests,
      cacheHit: !!ifNoneMatch,
      tokenExp: payload.exp
    });
    
    return response;

  } catch (err) {
    console.error(`Token verification error (${correlationId}):`, err);
    
    const failureDuration = Date.now() - requestStart;
    const errorObj = err as Error;
    
    const response = NextResponse.json(
      {
        valid: false,
        error: 'Invalid token',
        correlationId,
        code: errorObj instanceof Error ? errorObj.name : 'VERIFICATION_ERROR'
      },
      { status: 401 }
    );
    
    response.headers.set('x-correlation-id', correlationId);
    // Don't cache errors
    response.headers.set('Cache-Control', 'no-store, must-revalidate');

    console.debug(`Token verification failure (${correlationId}):`, {
      duration: failureDuration,
      concurrentRequests,
      error: errorObj instanceof Error ? errorObj.name : 'VERIFICATION_ERROR'
    });
    
    return response;
  }
}

// Force this route to be processed as a Node.js API route
export const preferredRegion = 'home';

// Cleanup concurrent request counter
export function GET() {
  global.activeVerifications = Math.max(0, (global.activeVerifications || 1) - 1);
  return NextResponse.json({ status: 'ok' });
}