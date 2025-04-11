/**
 * Authentication System Configuration
 */

// Default cookie durations
export const COOKIE_DURATIONS = {
  accessToken: 7 * 24 * 60 * 60, // 7 days
  refreshToken: 90 * 24 * 60 * 60, // 90 days
  rememberMe: 365 * 24 * 60 * 60 // 1 year
} as const;

// API route runtime configurations
export const ROUTE_CONFIG = {
  auth: {
    // Routes that need Node.js runtime (for email, crypto, etc.)
    nodeRoutes: [
      '/api/auth/password/reset',
      '/api/auth/verify',
    ],
    // Routes that can use Edge runtime
    edgeRoutes: [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/auth/me',
    ]
  }
} as const;

// Auth system feature flags
export const AUTH_FEATURES = {
  emailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  rememberMe: true, // Always enable for better persistence
  passwordReset: true,
  accountLocking: true,
} as const;

// Security settings
export const SECURITY_CONFIG = {
  // Token settings
  tokens: {
    accessTokenExpiry: '7d', // Match cookie duration
    refreshTokenExpiry: '90d',
    algorithm: 'HS256',
  },
  // Password requirements
  password: {
    minLength: 6,
    requireSpecialChar: false, // Can be enabled if needed
    requireNumber: false,
    requireUppercase: false,
  },
  // Session settings
  session: {
    maxSessions: 5, // Maximum concurrent sessions per user
    renewalThreshold: 5 * 60, // Renew token 5 minutes before expiry
  }
} as const;

// Cookie settings
export const COOKIE_CONFIG = {
  accessToken: {
    name: 'access_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    priority: 'high' as const,
  },
  refreshToken: {
    name: 'refresh_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    priority: 'high' as const,
  },
  rememberMe: {
    name: 'remember_me',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
} as const;

// Error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'Please verify your email to continue',
  ACCOUNT_DISABLED: 'This account has been disabled',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'An error occurred. Please try again later',
  EMAIL_IN_USE: 'Email already in use',
  USERNAME_TAKEN: 'Username already taken',
  INVALID_PASSWORD: 'Invalid password format',
  TOKEN_EXPIRED: 'Session expired. Please login again',
} as const;

// Development helpers
export const DEV_CONFIG = {
  logEmails: process.env.NODE_ENV !== 'production',
  verboseErrors: process.env.NODE_ENV !== 'production',
  mockEmailService: !process.env.SMTP_USER || !process.env.SMTP_PASS,
} as const;