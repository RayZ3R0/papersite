import { IUser } from '@/models/User';
import mongoose from 'mongoose';
import { JWTPayload as JoseJWTPayload } from 'jose';

// User without sensitive fields
export type UserWithoutPassword = Omit<IUser, 'password' | 'refreshToken'> & {
  _id: mongoose.Types.ObjectId;
};

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Register data
export interface RegisterData extends LoginCredentials {
  email?: string;
}

// JWT payload
export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  username: string;
  role: IUser['role'];
  [key: string]: string | string[] | number | boolean | null | undefined;
}

// Auth API responses
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserWithoutPassword;
  error?: string;
}

// Login modal options
export interface LoginModalOptions {
  message?: string;
  returnTo?: string;
}

// Auth error types
export type AuthErrorType = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USERNAME_TAKEN'
  | 'EMAIL_TAKEN'
  | 'INVALID_TOKEN'
  | 'USER_BANNED'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR';

// Custom auth error
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Protected route configuration
export interface ProtectedRouteConfig {
  roles?: IUser['role'][];
  redirectTo?: string;
  message?: string;
}

// Role levels for permission checks
export const ROLE_LEVELS = {
  user: 0,
  moderator: 1,
  admin: 2,
} as const;

// Helper function to check if role has sufficient permission level
export function hasPermissionLevel(
  userRole: IUser['role'], 
  requiredRole: IUser['role']
): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}