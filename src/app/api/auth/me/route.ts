import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import { User } from '@/models/User';

// Mark this endpoint as dynamic since it requires database access
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get verified payload from token
    const payload = await requireAuth();

    // If we're in a static context, payload might be null
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Find user and exclude password
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    // Return null for unauthorized users without error
    if (error instanceof AuthError && error.code === 'INVALID_TOKEN') {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Handle other errors
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}