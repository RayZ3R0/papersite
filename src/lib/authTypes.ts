import { UserRole } from './auth/jwt';

export class AuthError extends Error {
  type: 'UNAUTHORIZED' | 'FORBIDDEN' | 'SERVER_ERROR';

  constructor(message: string, type: 'UNAUTHORIZED' | 'FORBIDDEN' | 'SERVER_ERROR' = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.type = type;
  }
}

export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
  createdAt: Date;
  lastLogin?: Date;
  banned: boolean;
  verified: boolean;
  // Academic info
  subjects?: string[];
  session?: string;
  institution?: string;
  studyGoals?: string;
  // Preferences
  notifications?: boolean;
  studyReminders?: boolean;
  // Additional fields
  profilePicture?: string;
}

// Base type without password and with backwards compatibility
export type UserWithoutPassword = Omit<IUser, 'password' | 'refreshToken'> & {
  userId?: string; // Optional for backward compatibility
};

// For JWT tokens, we only need essential user data
export interface UserTokenData {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
}

// Extend the token data with auth properties
export interface UserTokenPayload extends UserTokenData {
  jti?: string;
  iat?: number;
  exp?: number;
}

// Helper functions for type compatibility
export function ensureUserId(user: UserWithoutPassword): UserWithoutPassword & { userId: string } {
  return {
    ...user,
    userId: user.userId || user._id
  };
}

// Convert JWT payload to UserWithoutPassword
export function jwtToUser(payload: any): UserWithoutPassword {
  return {
    _id: payload._id || payload.userId,
    userId: payload.userId || payload._id,
    email: payload.email,
    username: payload.username,
    role: payload.role,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    banned: payload.banned || false,
    verified: payload.verified || false,
    lastLogin: payload.lastLogin ? new Date(payload.lastLogin) : new Date()
  };
}

// Function to convert full user to token data
export function userToTokenData(user: IUser): UserTokenData {
  return {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };
}

// Function to check if object has user properties
export function hasUserProperties(obj: any): obj is UserWithoutPassword {
  return (
    typeof obj === 'object' &&
    typeof obj._id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.role === 'string'
  );
}

// Function to check if object is a valid token payload
export function isTokenPayload(obj: any): obj is UserTokenPayload {
  return (
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.role === 'string'
  );
}