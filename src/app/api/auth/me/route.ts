import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/auth/validation';
import { AuthError } from '@/lib/authTypes';
import { withDb, handleOptions } from '@/lib/api-middleware';

export const GET = withDb(async (request: NextRequest) => {
  try {
    // Verify authentication and get user ID
    let payload;
    try {
      payload = await requireAuth();
    } catch (error) {
      // Return null for unauthorized users without error
      if (error instanceof AuthError && error.type === 'UNAUTHORIZED') {
        return NextResponse.json({ user: null }, { status: 401 });
      }
      throw error;
    }

    // Find user in database
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert to JSON to remove sensitive fields
    const userData = user.toJSON();

    return NextResponse.json({
      user: userData
    });
  } catch (error) {
    // Log only unexpected errors
    if (!(error instanceof AuthError && error.type === 'UNAUTHORIZED')) {
      console.error('Get user error:', error);
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'SERVER_ERROR' ? 500 : 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'OPTIONS']);