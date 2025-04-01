import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';
import { AuthError } from '@/lib/authTypes';
import { User } from '@/models/User';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  username: string;
}

export async function validateLoginCredentials(credentials: LoginCredentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new AuthError('Email and password are required');
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AuthError('Invalid credentials format');
  }

  // Validate email format
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new AuthError('Invalid email format');
  }

  // Validate password length
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters long');
  }
}

export async function validateRegisterData(data: RegisterData) {
  const { email, password, username } = data;

  // First validate login credentials
  await validateLoginCredentials({ email, password });

  // Validate username
  if (!username || typeof username !== 'string') {
    throw new AuthError('Username is required');
  }

  if (username.length < 3 || username.length > 30) {
    throw new AuthError('Username must be between 3 and 30 characters');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new AuthError('Username can only contain letters, numbers, hyphens and underscores');
  }

  // Check if username or email is already taken
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AuthError('Email already in use');
    }
    if (existingUser.username === username) {
      throw new AuthError('Username already taken');
    }
  }
}

export async function verifyUserStatus(user: any) {
  if (!user) {
    throw new AuthError('User not found');
  }

  if (user.banned) {
    throw new AuthError('Account has been banned', 'FORBIDDEN');
  }

  // Optional: Check if email is verified
  if (!user.verified) {
    // You might want to handle unverified users differently
    console.warn('Unverified user login:', user.email);
  }
}

/**
 * Validates role access
 */
export function validateRoleAccess(
  requiredRoles: string[],
  userRole?: string
): boolean {
  if (!userRole || !requiredRoles.includes(userRole)) {
    return false;
  }
  return true;
}

/**
 * Get the token from cookies and verify it
 */
export async function getAuthUser(): Promise<JWTPayload> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new AuthError('No token found');
  }

  try {
    const decoded = await verifyToken(token);
    return decoded;
  } catch (error) {
    throw new AuthError('Invalid token');
  }
}

/**
 * Require authentication for an endpoint
 * Returns the authenticated user payload or throws AuthError
 */
export async function requireAuth(): Promise<JWTPayload> {
  try {
    const user = await getAuthUser();
    if (!user) {
      throw new AuthError('Authentication required');
    }
    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Authentication failed', 'SERVER_ERROR');
  }
}

/**
 * Require specific roles for an endpoint
 * Returns the authenticated user payload or throws AuthError
 */
export async function requireRole(roles: string[]): Promise<JWTPayload> {
  const user = await requireAuth();

  if (!validateRoleAccess(roles, user.role)) {
    throw new AuthError('Insufficient permissions', 'FORBIDDEN');
  }

  return user;
}

/**
 * Require admin access for an endpoint
 * Returns the authenticated user payload or throws AuthError
 */
export async function requireAdmin(): Promise<JWTPayload> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new AuthError('Admin access required', 'FORBIDDEN');
  }

  return user;
}