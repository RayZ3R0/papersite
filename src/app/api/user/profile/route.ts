import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { withDb, handleOptions, createErrorResponse, ApiMiddlewareOptions } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';

// Configure runtime and dynamic settings
export const runtime = 'nodejs'; // Force Node.js runtime for Mongoose
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable cache

// Connection options for better reliability
const connectionOptions: ApiMiddlewareOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  validateConnection: true
};

export const GET = withDb(async (req: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();
    // console.log('Auth payload:', { userId: payload.userId });

    // Find user and exclude sensitive fields
    const user = await User.findById(
      payload.userId,
      '-password -refreshToken -verificationToken -resetPasswordToken'
    ).lean();

    if (!user) {
      console.log('User not found:', payload.userId);
      return createErrorResponse({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404);
    }

    // console.log('Raw user data:', JSON.stringify(user, null, 2));

    // Get request tracking ID
    const requestId = req.headers.get('x-request-id');

    // Structure and validate response data
    const userData = {
      _id: user._id?.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      verified: !!user.verified,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      lastLogin: user.lastLogin?.toISOString() || new Date().toISOString()
    };

    const profileData = {
      success: true,
      user: userData,
      subjects: Array.isArray(user.subjects) ? user.subjects : [],
      studyPreferences: {
        dailyStudyHours: user.studyPreferences?.dailyStudyHours || 0,
        preferredStudyTime: user.studyPreferences?.preferredStudyTime || 'morning',
        notifications: user.studyPreferences?.notifications ?? true
      },
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId })
    };

    // console.log('Processed profile data:', JSON.stringify(profileData, null, 2));
    return NextResponse.json(profileData);

  } catch (error: any) {
    console.error('Profile fetch error:', error, error.stack);
    return createErrorResponse({
      message: error?.message || 'Failed to fetch profile',
      code: error?.code || 'PROFILE_ERROR',
      requestId: req.headers.get('x-request-id')
    }, error?.status || 500);
  }
}, connectionOptions);

export const PATCH = withDb(async (req: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();
    const data = await req.json();

    // Validate update data
    if (!data || (typeof data !== 'object')) {
      return createErrorResponse({
        message: 'Invalid update data',
        code: 'INVALID_REQUEST'
      }, 400);
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        $set: {
          subjects: data.subjects,
          studyPreferences: data.studyPreferences,
        }
      },
      {
        new: true,
        select: '-password -refreshToken -verificationToken -resetPasswordToken',
        runValidators: true
      }
    ).lean();

    if (!user) {
      return createErrorResponse({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404);
    }

    // Get request tracking ID
    const requestId = req.headers.get('x-request-id');

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      subjects: user.subjects || [],
      studyPreferences: user.studyPreferences || {
        dailyStudyHours: 0,
        preferredStudyTime: 'morning',
        notifications: true
      },
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId })
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return createErrorResponse({
      message: error?.message || 'Failed to update profile',
      code: error?.code || 'PROFILE_UPDATE_ERROR',
      requestId: req.headers.get('x-request-id')
    }, error?.status || 500);
  }
}, connectionOptions);

// Handle preflight requests with improved CORS headers
export const OPTIONS = () => handleOptions(['GET', 'PATCH', 'OPTIONS']);

// Maximum duration for the API route
export const maxDuration = 10; // seconds