import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { withDb, handleOptions } from '@/lib/api-middleware';

export const POST = withDb(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Username validation
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email validation if provided
    if (email && !email.match(/^\S+@\S+\.\S+$/)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await registerUser({ username, password, email });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'SERVER_ERROR' ? 500 : 400 }
      );
    }

    // Handle duplicate key errors from MongoDB
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Username or email is already taken' },
        { status: 400 }
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