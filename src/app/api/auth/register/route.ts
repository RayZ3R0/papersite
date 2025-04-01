import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from '@/lib/authTypes';
import { registerUser } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const handleRegister = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      email,
      password,
      username,
      subjects,
      session,
      institution,
      studyGoals,
      notifications,
      studyReminders,
      profilePicture
    } = body;

    // Attempt registration with all data
    const result = await registerUser({
      email,
      password,
      username,
      subjects,
      session,
      institution,
      studyGoals,
      notifications,
      studyReminders,
      profilePicture
    });

    // Set auth cookie
    const cookieStore = cookies();
    cookieStore.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(result.expiresAt * 1000)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.type === 'UNAUTHORIZED' ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const POST = withDb(handleRegister);

// Handle CORS preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}