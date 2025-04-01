import { User } from '@/models/User';
import { AuthError } from '@/lib/authTypes';
import { 
  validateLoginCredentials,
  validateRegisterData,
  verifyUserStatus,
  requireAuth,
  requireRole,
  requireAdmin
} from './validation';
import {
  signToken,
  verifyToken,
  getToken,
  getCurrentUser,
  type JWTPayload,
  type TokenResponse,
  type UserRole,
  getTokensFromCookies
} from './jwt';

// Extended registration data interface
interface ExtendedRegisterData {
  email: string;
  password: string;
  username: string;
  subjects?: string[];
  session?: string;
  institution?: string;
  studyGoals?: string;
  notifications?: boolean;
  studyReminders?: boolean;
  profilePicture?: string;
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  try {
    // Validate credentials
    await validateLoginCredentials({ email, password });

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthError('Invalid credentials');
    }

    // Check user status
    await verifyUserStatus(user);

    // Generate token
    const payload: JWTPayload = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role as UserRole
    };

    // Sign token
    return await signToken(payload);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('An error occurred during login', 'SERVER_ERROR');
  }
}

export async function logoutUser(): Promise<void> {
  // Nothing to do server-side, cookies are cleared client-side
}

export async function refreshUserToken(refreshToken: string): Promise<TokenResponse> {
  try {
    // Verify refresh token
    const decoded = await verifyToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    // Generate new token
    const payload: JWTPayload = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role as UserRole
    };

    return await signToken(payload);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to refresh token', 'SERVER_ERROR');
  }
}

export async function registerUser(
  data: ExtendedRegisterData
): Promise<TokenResponse> {
  try {
    // Validate base registration data
    await validateRegisterData({ 
      email: data.email, 
      password: data.password, 
      username: data.username 
    });

    // Create user with all provided data
    const user = await User.create({
      email: data.email,
      password: data.password,
      username: data.username,
      role: 'user',
      // Optional academic info
      subjects: data.subjects || [],
      session: data.session,
      institution: data.institution,
      studyGoals: data.studyGoals,
      // Optional preferences
      notifications: data.notifications ?? true,
      studyReminders: data.studyReminders ?? true,
      // Additional fields
      profilePicture: data.profilePicture
    });

    // Generate token
    const payload: JWTPayload = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role as UserRole
    };

    // Sign token
    return await signToken(payload);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Registration failed', 'SERVER_ERROR');
  }
}

// Re-export types
export type { JWTPayload, TokenResponse, UserRole };
export type { AuthError };

// Re-export auth utilities
export {
  requireAuth,
  requireRole,
  requireAdmin,
  verifyToken,
  getToken,
  getCurrentUser,
  getTokensFromCookies,
  validateLoginCredentials,
  validateRegisterData,
  verifyUserStatus,
  signToken
};