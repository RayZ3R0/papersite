import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

// Handle GET request to fetch user profile
const handleGet = async (request: NextRequest) => {
  try {
    const authData = await requireAuth();
    const user = await User.findById(authData.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: user.toSafeObject() });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
};

// Handle PATCH request to update user profile
const handlePatch = async (request: NextRequest) => {
  try {
    const authData = await requireAuth();
    const body = await request.json();

    // Fields that can be updated
    const allowedFields = [
      'subjects',
      'session',
      'institution',
      'studyGoals',
      'notifications',
      'studyReminders',
      'profilePicture'
    ];

    // Filter out any fields that aren't allowed
    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as Record<string, any>);

    const user = await User.findByIdAndUpdate(
      authData.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: user.toSafeObject() });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const GET = withDb(handleGet);
export const PATCH = withDb(handlePatch);

// Handle CORS preflight requests
export const OPTIONS = withDb(async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}, { requireConnection: false });