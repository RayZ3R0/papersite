import { NextRequest } from 'next/server';
import { validateSignedRequest, encryptResponse } from '@/lib/auth/request-security';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_CONFIG } from '@/lib/auth/config';

const API_BASE = process.env.PAPERVOID_API_URL;

if (!API_BASE) {
  throw new Error('PAPERVOID_API_URL environment variable is not set');
}



export async function GET(request: NextRequest) {
  try {
    // 1. Verify request signature first
    const requestToken = request.headers.get('x-request-token');
    const requestTimestamp = request.headers.get('x-request-timestamp');
    const requestSignature = request.headers.get('x-request-signature');

    if (!requestToken || !requestTimestamp || !requestSignature) {
      return new Response('Missing request security headers', { status: 400 });
    }

    const isValidRequest = await validateSignedRequest(
      requestToken,
      parseInt(requestTimestamp),
      requestSignature
    );
    
    if (!isValidRequest) {
      return new Response('Invalid request signature', { status: 403 });
    }
    
    // 2. Get and validate path parameter
    const path = request.nextUrl.searchParams.get('path');
    if (!path) {
      return new Response('Path is required', { status: 400 });
    }

    // 3. Handle auth token for non-public paths
    const accessToken = request.cookies.get(COOKIE_CONFIG.accessToken.name);
    
    if (!request.nextUrl.pathname.startsWith('/api/marks')) {
      if (!accessToken?.value) {
        return new Response('Unauthorized', { status: 401 });
      }

      try {
        await verifyToken(accessToken.value);
      } catch {
        return new Response('Invalid token', { status: 401 });
      }
    }

    // 4. Verify request origin
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');

    // Get the hostname from the current request
    const currentHost = request.headers.get('host');

    if (!currentHost) {
      return new Response('Missing host header', { status: 400 });
    }

    // Check if the origin matches the current host
    let isValidOrigin = true;
    if (origin) {
      try {
        const originHostname = new URL(origin).hostname;
        const currentHostname = currentHost.split(':')[0]; // Remove port if present
        isValidOrigin = originHostname === currentHostname;
      } catch {
        isValidOrigin = false;
      }
    }

    // Check if referer matches current host
    let isValidReferer = true;
    if (referer) {
      try {
        const refererHostname = new URL(referer).hostname;
        const currentHostname = currentHost.split(':')[0]; // Remove port if present
        isValidReferer = refererHostname === currentHostname;
      } catch {
        isValidReferer = false;
      }
    }

    if (!isValidReferer && !isValidOrigin) {
      return new Response('Invalid origin', { status: 403 });
    }

    // 5. Forward request to API with security headers
    const headers: Record<string, string> = {
      'X-Request-ID': requestToken
    };

    // Add Authorization header if token is available
    if (accessToken?.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    const response = await fetch(`${API_BASE}/marks${path}`, { headers });

    const data = await response.json();

    // 6. Encrypt and return response data
    const encryptedData = await encryptResponse(data);
    return new Response(JSON.stringify({ success: true, data: encryptedData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'same-origin'
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error' 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}