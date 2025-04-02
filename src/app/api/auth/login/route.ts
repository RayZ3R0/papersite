import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { AuthError } from '@/lib/authTypes';

export const POST = withDb(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, username, password, rememberMe } = body;

    // Basic validation
    if ((!email && !username) || !password) {
      return createErrorResponse('Email/username and password are required', 400);
    }

    // Handle login
    const { user } = await loginUser({ 
      email, 
      username,
      password,
      options: {
        sessionDuration: rememberMe ? 30 * 24 * 60 * 60 : undefined // 30 days if remember me
      }
    });

    // Return user data
    return createSuccessResponse({ user });
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