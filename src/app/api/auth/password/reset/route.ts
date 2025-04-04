import { NextRequest, NextResponse } from 'next/server';
import { withDb, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { User } from '@/models/User';
import { emailService } from '@/lib/email/emailService';
import { generatePasswordResetToken, verifyTokenOfType, clearTokens } from '@/lib/auth/tokens';

export const dynamic = 'force-dynamic';

// Request password reset
export const POST = withDb(async (request: NextRequest) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return createErrorResponse('Email is required', 400);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.email) {
      // Return success even if user not found to prevent email enumeration
      return createSuccessResponse({
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }

    // Generate and send reset token
    const resetToken = await generatePasswordResetToken(email);
    if (!resetToken) {
      return createSuccessResponse({
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Still return success to prevent email enumeration
    }

    return createSuccessResponse({
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return createErrorResponse('Failed to process password reset request', 500);
  }
});

// Handle password reset
export const PUT = withDb(async (request: NextRequest) => {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return createErrorResponse('Token and new password are required', 400);
    }

    // Verify the token
    const isValid = await verifyTokenOfType(token, 'reset');
    if (!isValid) {
      return createErrorResponse('Invalid or expired reset token', 400);
    }

    // Find user with matching reset token
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Update password and clear reset tokens
    user.password = password;
    await clearTokens(user._id.toString(), 'reset');

    return createSuccessResponse({
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return createErrorResponse('Failed to reset password', 500);
  }
});