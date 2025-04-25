import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { headers } from 'next/headers';
import { COOKIE_CONFIG } from '@/lib/auth/config';

const { accessToken: ACCESS_TOKEN_CONFIG } = COOKIE_CONFIG;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const token = await request.text();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token and get payload
    const payload = await verifyToken(token);

    return NextResponse.json({ 
      valid: true,
      payload: {
        userId: payload.userId,
        username: payload.username,
        role: payload.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Invalid token'
      },
      { status: 401 }
    );
  }
}

// Force this route to be processed as a Node.js API route
export const preferredRegion = 'home';