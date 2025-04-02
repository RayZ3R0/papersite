import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { withDb, handleOptions } from '@/lib/api-middleware';

export const POST = withDb(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await loginUser({ username, password });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'SERVER_ERROR' ? 500 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['POST', 'OPTIONS']);