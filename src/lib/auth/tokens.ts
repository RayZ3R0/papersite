import crypto from 'crypto';
import { User } from '@/models/User';
import { emailService } from '@/lib/email/emailService';

/**
 * Generate a verification token for a user
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Save hashed token
  user.verificationToken = hash;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  return token;
}

/**
 * Send verification email to a user
 */
export async function sendVerificationEmail(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user || !user.email) {
    throw new Error('User not found or has no email');
  }

  // Generate token
  const token = await generateVerificationToken(userId);

  // Send email
  await emailService.sendVerificationEmail(user.email, token);
}

/**
 * Generate a password reset token for a user
 */
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return null;
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Save hashed token
  user.resetPasswordToken = hash;
  user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  return token;
}

/**
 * Verify a token (can be used for both verification and reset tokens)
 */
export async function verifyTokenOfType(token: string, type: 'verification' | 'reset'): Promise<boolean> {
  // Hash the provided token
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Build query based on token type
  const query = type === 'verification'
    ? {
        verificationToken: hash,
        verificationTokenExpires: { $gt: new Date() }
      }
    : {
        resetPasswordToken: hash,
        resetPasswordTokenExpires: { $gt: new Date() }
      };

  // Check if a user exists with this valid token
  const user = await User.findOne(query);
  return !!user;
}

/**
 * Clear tokens after use
 */
export async function clearTokens(userId: string, type: 'verification' | 'reset'): Promise<void> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (type === 'verification') {
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    if (!user.verified) {
      user.verified = true;
    }
  } else {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
  }

  await user.save();
}