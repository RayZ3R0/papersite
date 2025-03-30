import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { withDb, handleOptions } from '@/lib/api-middleware';

export const POST = withDb(async (request: NextRequest) => {
  try {
    await logoutUser();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    console.error('Logout error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'SERVER_ERROR' ? 500 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['POST', 'OPTIONS']);