import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/api-middleware';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { AuthError, AUTH_ERRORS } from '@/lib/authTypes';
import { registerUser } from '@/lib/auth';
import { validateRegisterData } from '@/lib/auth/validation';
import mongoose from 'mongoose';
import {
  RegistrationData,
  RegisterData,
  MongoError,
  ValidationError
} from '@/types/registration';

// Use Node.js runtime for mongoose and bcrypt
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Maximum duration for registration process (in seconds)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const data: RegistrationData = await req.json();
    const { basicInfo, subjects, studyPreferences, currentSession } = data;

    // Validate required fields
    if (!basicInfo?.username || !basicInfo?.email || !basicInfo?.password) {
      return createErrorResponse('Username, email and password are required', 400);
    }

    // Validate registration data
    try {
      validateRegisterData(basicInfo);
    } catch (error) {
      if (error instanceof AuthError) {
        return createErrorResponse(error.message, 400);
      }
      throw error;
    }

    // Register user through auth service
    const registerData: RegisterData = {
      ...basicInfo,
      subjects,
      studyPreferences,
      currentSession
    };

    const result = await registerUser(registerData);

    if (!result || !result.user) {
      return createErrorResponse(AUTH_ERRORS.SERVER_ERROR, 500);
    }

    // Format response data
    const responseData = {
      user: {
        id: result.user._id.toString(),
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        verified: result.user.verified,
        createdAt: result.user.createdAt?.toISOString(),
        subjects: subjects || [],
        studyPreferences: studyPreferences || null,
        currentSession: currentSession || null
      },
      message: 'Registration successful. Please verify your email.',
      verificationRequired: true
    };

    return createSuccessResponse(responseData, 201);
  } catch (error: unknown) {
    // Enhanced error logging for debugging connection issues
    console.error('Registration error details:', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      timeoutMS: (error as any)?.timeoutMS,
      connectionState: mongoose.connection?.readyState
    });

    // Handle known auth errors
    if (error instanceof AuthError) {
      return createErrorResponse(error.message, 400);
    }

    // Handle MongoDB connection timeout specifically
    if ((error as Error)?.message?.includes('buffering timed out after')) {
      return createErrorResponse(
        'Registration service is temporarily busy. Please try again in a moment.',
        503
      );
    }

    // Handle validation errors from mongoose
    if (error && (error as ValidationError).name === 'ValidationError') {
      const validationError = error as ValidationError;
      const messages = Object.values(validationError.errors)
        .map(err => err.message)
        .join(', ');
      return createErrorResponse(`Validation failed: ${messages}`, 400);
    }

    // Handle duplicate key errors from mongodb
    if (error && (error as MongoError).code === 11000) {
      const mongoError = error as MongoError;
      const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
      return createErrorResponse(
        `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        409
      );
    }

    return createErrorResponse(AUTH_ERRORS.SERVER_ERROR, 500);
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}