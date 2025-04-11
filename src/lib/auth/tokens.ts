import { User } from '@/models/User';
import { AuthError } from '@/lib/authTypes';
import { generateSecureToken, generateSessionId } from './crypto';

const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Generate and save email verification token
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthError('USER_NOT_FOUND', 'User not found');
    }

    // Generate both token and session ID for better tracking
    const [token, sessionId] = await Promise.all([
      generateSecureToken(),
      generateSessionId()
    ]);
    
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);
    user.verificationSessionId = sessionId; // Track verification session
    await user.save();

    return token;
  } catch (error) {
    console.error('Error generating verification token:', error);
    throw new AuthError('TOKEN_GENERATION_FAILED', 'Failed to generate verification token');
  }
}

/**
 * Generate and save password reset token
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthError('USER_NOT_FOUND', 'User not found');
    }

    // Generate both token and session ID for better tracking
    const [token, sessionId] = await Promise.all([
      generateSecureToken(),
      generateSessionId()
    ]);
    
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);
    user.resetPasswordSessionId = sessionId; // Track reset session
    await user.save();

    return token;
  } catch (error) {
    console.error('Error generating password reset token:', error);
    throw new AuthError('TOKEN_GENERATION_FAILED', 'Failed to generate password reset token');
  }
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    return false;
  }

  user.verified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return true;
}

/**
 * Send verification email
 * This is a placeholder function - implement actual email sending logic
 */
export async function sendVerificationEmail(userId: string): Promise<void> {
  // Skip if email verification is disabled
  if (process.env.REQUIRE_EMAIL_VERIFICATION !== 'true') {
    // Automatically verify the user
    const user = await User.findById(userId);
    if (user) {
      user.verified = true;
      await user.save();
    }
    return;
  }

  try {
    const token = await generateVerificationToken(userId);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

    // TODO: Implement actual email sending
    // For now, just log the verification URL
    // console.log('Verification URL:', verificationUrl);
    
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new AuthError('SERVER_ERROR', 'Failed to send verification email');
  }
}

/**
 * Send password reset email
 * This is a placeholder function - implement actual email sending logic
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    const token = await generatePasswordResetToken(email);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // TODO: Implement actual email sending
    // For now, just log the reset URL
    // console.log('Password reset URL:', resetUrl);
    
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new AuthError('SERVER_ERROR', 'Failed to send password reset email');
  }
}