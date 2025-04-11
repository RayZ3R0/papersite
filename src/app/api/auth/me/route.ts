import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { User } from '@/models/User';
import { AUTH_ERRORS } from '@/lib/auth/config';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Set maximum duration for user data fetch
export const maxDuration = 5; // 5 seconds

export async function GET() {
  try {
    // Get verified payload from token
    const payload = await requireAuth();

    // If we're in a static context, payload might be null
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Find user and exclude sensitive fields
    const user = await User.findById(payload.userId).select({
      password: 0,
      refreshToken: 0,
      verificationToken: 0,
      verificationTokenExpires: 0,
      resetPasswordToken: 0,
      resetPasswordTokenExpires: 0
    });
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    // Convert MongoDB document to plain object and handle dates
    const userObj = {
      ...user.toObject(),
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      lastPasswordChange: user.lastPasswordChange?.toISOString(),
      lockoutUntil: user.lockoutUntil?.toISOString()
    };

    return NextResponse.json({ 
      user: userObj,
      sessionInfo: {
        lastVerified: new Date().toISOString()
      }
    });
  } catch (error) {
    // Return null for unauthorized users without error
    if (error instanceof AuthError && error.code === 'INVALID_TOKEN') {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Handle other errors
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.SERVER_ERROR },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    },
  });
};