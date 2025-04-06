import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { AuthError } from '@/lib/authTypes';

export const dynamic = 'force-dynamic';

// Durations
const DURATIONS = {
  DEFAULT: 24 * 60 * 60, // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60 // 30 days
} as const;

export const POST = withDb(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, username, password, rememberMe } = body;

    // Basic validation
    if ((!email && !username) || !password) {
      return createErrorResponse('Email/username and password are required', 400);
    }

    // Handle login with session duration based on remember me
    const { user } = await loginUser({ 
      email, 
      username,
      password,
      options: {
        sessionDuration: rememberMe ? DURATIONS.REMEMBER_ME : DURATIONS.DEFAULT
      }
    });

    // Return user data
    return createSuccessResponse({
      user,
      message: rememberMe ? 'Logged in with extended session' : 'Logged in successfully'
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof AuthError) {
      return createErrorResponse(
        error.message, 
        error.code === 'SERVER_ERROR' ? 500 : 401
      );
    }

    return createErrorResponse('An unexpected error occurred', 500);
  }
});