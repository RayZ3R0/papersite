import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { AuthCookieManager } from './cookies';
import { AuthError, LoginCredentials, RegisterData, UserRole } from '../authTypes';
import { User } from '@/models/User';

export function validateLoginCredentials(credentials: LoginCredentials) {
  // At least one identifier is required (email or username)
  if (!credentials.email && !credentials.username) {
    throw new AuthError('INVALID_CREDENTIALS', 'Email or username is required');
  }

  if (!credentials.password) {
    throw new AuthError('INVALID_CREDENTIALS', 'Password is required');
  }

  if (credentials.email && !isValidEmail(credentials.email)) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email format');
  }

  if (credentials.password.length < 6) {
    throw new AuthError('INVALID_CREDENTIALS', 'Password must be at least 6 characters');
  }
}

export function validateRegisterData(data: RegisterData) {
  if (!data.username || data.username.length < 3) {
    throw new AuthError('INVALID_CREDENTIALS', 'Username must be at least 3 characters');
  }

  if (!isValidEmail(data.email)) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email format');
  }

  if (!data.password || data.password.length < 6) {
    throw new AuthError('INVALID_CREDENTIALS', 'Password must be at least 6 characters');
  }
}

export async function verifyUserStatus(user: any) {
  // Email verification check
  if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.verified) {
    throw new AuthError('USER_NOT_VERIFIED', 'Please verify your email to continue');
  }

  if (user.disabled) {
    throw new AuthError('ACCOUNT_DISABLED', 'This account has been disabled');
  }
}

export async function requireAuth() {
  const { accessToken, refreshToken } = AuthCookieManager.getTokens();

  if (!accessToken && !refreshToken) {
    throw new AuthError('INVALID_TOKEN', 'Authentication required');
  }

  try {
    // Try access token first
    if (accessToken) {
      const payload = await verifyToken(accessToken);
      if (payload) {
        return payload;
      }
    }

    // If access token is invalid or missing, try refresh token
    if (refreshToken) {
      const { refreshUserToken } = await import('@/lib/auth');
      const result = await refreshUserToken(refreshToken, true);
      if (result?.user) {
        return {
          userId: result.user._id,
          username: result.user.username,
          role: result.user.role
        };
      }
    }

    throw new AuthError('INVALID_TOKEN', 'Invalid or expired tokens');
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('INVALID_TOKEN', 'Failed to authenticate');
  }
}

export async function requireRole(roles: UserRole[]) {
  const payload = await requireAuth();
  
  // Find user and verify role
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AuthError('USER_NOT_FOUND', 'User not found');
  }

  if (!roles.includes(user.role)) {
    throw new AuthError('INVALID_TOKEN', 'Insufficient permissions');
  }

  return payload;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to extract and verify token from request
export async function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('INVALID_TOKEN', 'Invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}