export interface UserWithoutPassword {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
}

export type UserRole = 'user' | 'moderator' | 'admin';

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  options?: {
    sessionDuration?: number;  // Duration in seconds
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_NOT_VERIFIED'
  | 'ACCOUNT_DISABLED'
  | 'INVALID_TOKEN'
  | 'SERVER_ERROR';