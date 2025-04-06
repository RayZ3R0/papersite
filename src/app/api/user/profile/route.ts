import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { withDb, handleOptions } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';

// Make route dynamic
export const dynamic = 'force-dynamic';

export const GET = withDb(async (req: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    // Find user and exclude sensitive fields
    const user = await User.findById(
      payload.userId,
      '-password -refreshToken -verificationToken -resetPasswordToken'
    ).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Structure the response data
    const profileData = {
      user,
      subjects: user.subjects || [],
      studyPreferences: user.studyPreferences || {
        dailyStudyHours: 0,
        preferredStudyTime: 'morning',
        notifications: true
      }
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
});

export const PATCH = withDb(async (req: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();
    const data = await req.json();

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
        select: '-password -refreshToken -verificationToken -resetPasswordToken'
      }
    ).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user,
      subjects: user.subjects || [],
      studyPreferences: user.studyPreferences || {}
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'PATCH', 'OPTIONS']);