import { NextResponse } from 'next/server';
import { AuthError } from '@/lib/authTypes';
import { clearAuthTokens } from '@/lib/auth/edge';
import { logoutUser } from '@/lib/auth';

// Use Node.js runtime for database operations
export const runtime = 'nodejs';

export async function POST() {
  try {
    // First clear auth tokens (Edge compatible)
    await clearAuthTokens();
    
    // Then handle database operations (Node.js)
    try {
      await logoutUser();
    } catch (error) {
      // Log but don't fail if DB cleanup fails
      console.error('DB cleanup error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'SERVER_ERROR' ? 500 : 400 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';