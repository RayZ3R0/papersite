import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { validateLogin } from '@/lib/security/validation';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimit } from '@/lib/security/rateLimit';
import mongoose from 'mongoose';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Set maximum duration
export const maxDuration = 15;

/**
 * Handle login request
 */
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    // Check rate limits first
    const rateLimitResult = await rateLimit(request, 'login');
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Parse request body
    const body = await request.json();
    const { email, username, password, rememberMe } = body;

    // Validate input
    try {
      validateLogin({ email, username, password });
    } catch (error) {
      if (error instanceof AuthError) {
        return createSecureResponse(
          { error: error.message },
          400,
          'auth'
        );
      }
      throw error;
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Attempt login
    const result = await loginUser({
      email,
      username,
      password,
      options: {
        sessionDuration: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
        rememberMe
      }
    });

    // Log successful login in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${correlationId}] Successful login:`, {
        email: email || undefined,
        username: username || undefined,
        userId: result.user._id
      });
    }

    // Return success response
    return createSecureResponse({
      user: result.user,
      sessionInfo: {
        lastRefresh: new Date().toISOString(),
        sessionId: correlationId
      }
    }, 200, 'auth');

  } catch (error) {
    // Log error details
    console.error(`[${correlationId}] Login error:`, error);

    if (error instanceof AuthError) {
      return createSecureResponse(
        { error: error.message },
        error.code === 'SERVER_ERROR' ? 500 : 401,
        'auth'
      );
    }

    // Check for MongoDB connection errors
    if (error instanceof Error && 
        (error.name === 'MongooseError' || 
         error.name === 'MongoServerError' ||
         error.message.includes('MongoDB'))) {
      return createSecureResponse(
        { error: 'Database connection error' },
        503,
        'auth'
      );
    }

    // Generic error response
    return createSecureResponse(
      { error: 'An unexpected error occurred' },
      500,
      'auth'
    );

  } finally {
    // Ensure we don't keep idle connections
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.close();
      } catch (error) {
        console.error(`[${correlationId}] Error closing MongoDB connection:`, error);
      }
    }
  }
}

/**
 * Handle OPTIONS requests
 */
export async function OPTIONS() {
  return createSecureResponse(null, 204, 'auth');
}