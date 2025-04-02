import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { withDb } from '@/lib/api-middleware';

export const POST = withDb(async (request: Request) => {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Register user
    const { user } = await registerUser({
      username,
      email,
      password,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'SERVER_ERROR' ? 500 : 400 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});