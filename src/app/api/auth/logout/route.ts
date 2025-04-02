import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';

export async function POST() {
  try {
    await logoutUser();
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