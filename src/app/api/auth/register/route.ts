import { NextRequest, NextResponse } from 'next/server';
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

// Direct MongoDB connection for registration with higher timeouts
async function connectToMongo() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  // Close existing connection if any
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  
  // Use environment variables for timeouts with fallbacks
  const serverSelectionTimeoutMS = parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '30000', 10);
  const socketTimeoutMS = parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000', 10);
  const connectTimeoutMS = parseInt(process.env.MONGODB_CONNECTION_TIMEOUT || '30000', 10);
  
  // Connect with higher timeouts specifically for registration
  return mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS,
    socketTimeoutMS,
    connectTimeoutMS,
    maxPoolSize: 1,
    waitQueueTimeoutMS: serverSelectionTimeoutMS,
    retryWrites: true,
    family: 4
  });
}

export async function POST(req: NextRequest) {
  try {
    // Establish direct connection with higher timeouts
    await connectToMongo();
    
    const data: RegistrationData = await req.json();
    const { basicInfo, subjects, studyPreferences, currentSession } = data;

    // Rest of your existing code...
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
    // Error handling as before...
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
    if ((error as Error)?.message?.includes('buffering timed out after') || 
        (error as Error)?.message?.includes('timed out') ||
        (error as Error)?.message?.includes('timeout')) {
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
  } finally {
    // Always close the connection when done
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
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