import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { AuthError } from '@/lib/authTypes';
import { sendVerificationEmail } from '@/app/api/email/actions';

export const runtime = 'nodejs'; // Use Node.js runtime for email functionality
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get token from query params
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with matching verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user verification status
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email verification is enabled
    if (process.env.REQUIRE_EMAIL_VERIFICATION !== 'true') {
      // If disabled, automatically mark as verified
      user.verified = true;
      await user.save();
      
      return NextResponse.json({
        success: true,
        message: 'Email verification is currently disabled'
      });
    }
if (!user.email) {
  return NextResponse.json(
    { error: 'User email not found' },
    { status: 400 }
  );
}

// Generate new verification token using Web Crypto API
const array = new Uint8Array(32);
crypto.getRandomValues(array);
const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

user.verificationToken = token;
user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
await user.save();

// Send verification email using server action
const emailResult = await sendVerificationEmail(user.email, token);


    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}