import { NextRequest, NextResponse } from 'next/server';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';
import { verifyTokenOfType, clearTokens } from '@/lib/auth/tokens';
import { User } from '@/models/User';

export const POST = withDb(async (request: NextRequest) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return createErrorResponse('Verification token is required', 400);
    }

    // Verify the token
    const isValid = await verifyTokenOfType(token, 'verification');
    if (!isValid) {
      return createErrorResponse('Invalid or expired verification token', 400);
    }

    // Find user with matching verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Clear verification tokens and set verified status
    await clearTokens(user._id.toString(), 'verification');

    return createSuccessResponse({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return createErrorResponse('Failed to verify email', 500);
  }
});

// Handle verification link clicks
export const GET = withDb(async (request: NextRequest) => {
  try {
    const token = new URL(request.url).searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = await verifyTokenOfType(token, 'verification');
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Find user with matching verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Clear verification tokens and set verified status
    await clearTokens(user._id.toString(), 'verification');

    // Redirect to login page with success message
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('verified', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
});