import { ObjectId } from 'mongoose';

export type UserRole = 'user' | 'moderator' | 'admin';

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  options?: {
    sessionDuration?: number;
    rememberMe?: boolean;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_NOT_VERIFIED'
  | 'ACCOUNT_DISABLED'
  | 'INVALID_TOKEN'
  | 'SERVER_ERROR'
  | 'TOKEN_GENERATION_FAILED'
  | 'TOKEN_VERIFICATION_FAILED'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT'
  | 'ACCESS_DENIED';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface UserWithoutPassword {
  _id: ObjectId | string;
  username: string;
  email?: string;
  role: UserRole;
  verified: boolean;
  createdAt: Date | string;
  lastLogin?: Date | string;
  loginCount?: number;
  verificationAttempts?: number;
  resetPasswordAttempts?: number;
  lockoutUntil?: Date | string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  exp?: number;
  iat?: number;
  sub?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  sessionId?: string;
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
}

export interface TokenResponse {
  success?: boolean;
  user: UserWithoutPassword;
  sessionInfo?: {
    lastRefresh?: string;
    lastVerified?: string;
    sessionId?: string;
  };
  metadata?: {
    attempt?: number;
    requestId?: string;
    [key: string]: any;
  };
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'Email not verified',
  ACCOUNT_DISABLED: 'Account is disabled',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'An unexpected error occurred',
  TOKEN_GENERATION_FAILED: 'Failed to generate token',
  TOKEN_VERIFICATION_FAILED: 'Token verification failed',
  SESSION_EXPIRED: 'Session has expired',
  RATE_LIMIT: 'Too many attempts, please try again later',
  ACCESS_DENIED: 'Access denied'
} as const;

export interface AuthConfig {
  accessToken: {
    name: string;
    expiry: number;
    secure: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
  };
  refreshToken: {
    name: string;
    expiry: number;
    secure: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
  };
  session: {
    name: string;
    expiry: number;
  };
  validation: {
    passwordMinLength: number;
    usernameMinLength: number;
    maxLoginAttempts: number;
    maxVerificationAttempts: number;
    maxResetAttempts: number;
  };
  timeouts: {
    lockoutDuration: number; // milliseconds
    verificationExpiry: number;
    resetExpiry: number;
  };
}