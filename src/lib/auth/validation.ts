import { getTokensFromCookies, verifyToken } from './jwt';
import { AuthError, JWTPayload, LoginCredentials, RegisterData } from '../authTypes';
import { User } from '@/models/User';

// Validate login credentials
export function validateLoginCredentials(credentials: LoginCredentials): void {
  const { username, password } = credentials;

  if (!username || typeof username !== 'string' || username.length < 3) {
    throw new AuthError(
      'INVALID_CREDENTIALS',
      'Username must be at least 3 characters long'
    );
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AuthError(
      'INVALID_CREDENTIALS',
      'Password must be at least 6 characters long'
    );
  }
}

// Validate registration data
export function validateRegisterData(data: RegisterData): void {
  validateLoginCredentials(data);

  if (data.email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(data.email)) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email format');
    }
  }
}

// Verify user exists and is not banned
export async function verifyUserStatus(user: { banned: boolean } | null) {
  if (!user) {
    throw new AuthError('USER_NOT_FOUND', 'User not found');
  }

  if (user.banned) {
    throw new AuthError('USER_BANNED', 'User is banned');
  }
}

// Check if username is available
export async function checkUsernameAvailability(username: string): Promise<void> {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new AuthError('USERNAME_TAKEN', 'Username is already taken');
  }
}

// Check if email is available
export async function checkEmailAvailability(email: string): Promise<void> {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AuthError('EMAIL_TAKEN', 'Email is already registered');
  }
}

// Require authentication middleware helper
export async function requireAuth(): Promise<JWTPayload> {
  const { accessToken } = getTokensFromCookies();

  if (!accessToken) {
    throw new AuthError('UNAUTHORIZED', 'Authentication required');
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    throw new AuthError('INVALID_TOKEN', 'Invalid or expired token');
  }

  return payload;
}

// Require specific roles middleware helper
export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const payload = await requireAuth();

  if (!allowedRoles.includes(payload.role)) {
    throw new AuthError(
      'UNAUTHORIZED',
      'You do not have permission to access this resource'
    );
  }

  return payload;
}

// Validate password requirements
export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new AuthError(
      'INVALID_CREDENTIALS',
      'Password must be at least 6 characters long'
    );
  }

  // Add more password requirements as needed
  // Example: require numbers, special characters, etc.
}

// Sanitize user input
export function sanitizeUserInput(input: string): string {
  // Remove any HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, '');
  
  // Remove multiple spaces
  const withoutExtraSpaces = withoutTags.replace(/\s+/g, ' ');
  
  // Trim whitespace
  return withoutExtraSpaces.trim();
}