import { NextRequest } from 'next/server';
import { validateSignedRequest, encryptResponse } from '@/lib/auth/request-security';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_CONFIG } from '@/lib/auth/config';

const API_BASE = process.env.PAPERVOID_API_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!API_BASE) {
  throw new Error('PAPERVOID_API_URL environment variable is not set');
}

if (!APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
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

    // 2. Get and validate path
    const path = request.nextUrl.searchParams.get('path');
    if (!path) {
      return new Response('Path is required', { status: 400 });
    }

    // 3. Handle auth token for non-public paths
    const accessToken = request.cookies.get(COOKIE_CONFIG.accessToken.name);
    
    if (!path.startsWith('/subjects')) {
      if (!accessToken?.value) {
        return new Response('Unauthorized', { status: 401 });
      }

      try {
        await verifyToken(accessToken.value);
      } catch {
        return new Response('Invalid token', { status: 401 });
      }
    }

    // 2. Verify request origin is from a same-site context or trusted domain
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');

    // Skip origin check for same-site requests
    if (origin) {
      // If there's an origin header, verify it's from an allowed domain
      // Get the hostname from the current request
      const currentHost = request.headers.get('host');
      const originHost = new URL(origin).hostname;
      
      // Allow if origin matches current host or is a known trusted domain
      const isValidOrigin = originHost === currentHost;
      
      if (!isValidOrigin) {
        return new Response('Invalid origin', { status: 403 });
      }
    }

    // 4. Forward request to API with security headers
    const headers: Record<string, string> = {
      'X-Request-ID': requestToken
    };

    // Add Authorization header if token is available
    if (accessToken?.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    const response = await fetch(`${API_BASE}${path}`, { headers });

    const data = await response.json();

    // 5. Encrypt and return response data
    const encryptedData = await encryptResponse(data);
    return new Response(JSON.stringify({ data: encryptedData }), {
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
    return new Response('Internal Server Error', { status: 500 });
  }
}
