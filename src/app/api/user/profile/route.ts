import { NextRequest } from 'next/server';
import { AuthError } from '@/lib/authTypes';
import { validateProfile } from '@/lib/security/validation';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimit } from '@/lib/security/rateLimit';
import mongoose from 'mongoose';
import { User } from '@/models/User';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Set maximum duration
export const maxDuration = 30;

/**
 * Get user from request
 */
async function getUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AuthError('INVALID_TOKEN', 'No user ID found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError('USER_NOT_FOUND', 'User not found');
  }

  return user;
}

/**
 * Handle profile GET request
 */
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    // Check rate limits
    const rateLimitResult = await rateLimit(request, 'profile');
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Get user from request
    const user = await getUser(request);

    // Return profile data
    return createSecureResponse({
      profile: {
        subjects: user.subjects || [],
        studyPreferences: user.studyPreferences || {
          dailyStudyHours: 0,
          preferredStudyTime: 'morning',
          notifications: true
        }
      }
    }, 200, 'profile');

  } catch (error) {
    console.error(`[${correlationId}] Profile GET error:`, error);

    if (error instanceof AuthError) {
      return createSecureResponse(
        { error: error.message },
        error.code === 'USER_NOT_FOUND' ? 404 : 401,
        'profile'
      );
    }

    // Check for MongoDB errors
    if (error instanceof Error && 
        (error.name === 'MongooseError' || 
         error.name === 'MongoServerError' ||
         error.message.includes('MongoDB'))) {
      return createSecureResponse(
        { error: 'Database error' },
        503,
        'profile'
      );
    }

    return createSecureResponse(
      { error: 'An unexpected error occurred' },
      500,
      'profile'
    );

  } finally {
    // Close MongoDB connection
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
 * Handle profile PATCH request
 */
export async function PATCH(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  try {
    // Check rate limits
    const rateLimitResult = await rateLimit(request, 'profile');
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Parse and validate request body
    const updates = await request.json();
    try {
      validateProfile(updates);
    } catch (error) {
      if (error instanceof AuthError) {
        return createSecureResponse(
          { error: error.message },
          400,
          'profile'
        );
      }
      throw error;
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Get user and update profile
    const user = await getUser(request);
    
    if (updates.subjects) {
      user.subjects = updates.subjects;
    }
    
    if (updates.studyPreferences) {
      user.studyPreferences = {
        ...user.studyPreferences,
        ...updates.studyPreferences
      };
    }

    await user.save();

    // Log update in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${correlationId}] Profile updated:`, {
        userId: user._id,
        updates: JSON.stringify(updates)
      });
    }

    return createSecureResponse({
      profile: {
        subjects: user.subjects,
        studyPreferences: user.studyPreferences
      }
    }, 200, 'profile');

  } catch (error) {
    console.error(`[${correlationId}] Profile PATCH error:`, error);

    if (error instanceof AuthError) {
      return createSecureResponse(
        { error: error.message },
        error.code === 'USER_NOT_FOUND' ? 404 : 401,
        'profile'
      );
    }

    // Check for MongoDB errors
    if (error instanceof Error && 
        (error.name === 'MongooseError' || 
         error.name === 'MongoServerError' ||
         error.message.includes('MongoDB'))) {
      return createSecureResponse(
        { error: 'Database error' },
        503,
        'profile'
      );
    }

    return createSecureResponse(
      { error: 'An unexpected error occurred' },
      500,
      'profile'
    );

  } finally {
    // Close MongoDB connection
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
 * Handle OPTIONS request
 */
export async function OPTIONS() {
  return createSecureResponse(null, 204, 'profile');
}