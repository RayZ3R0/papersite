// Re-export all authentication functionality
export * from './auth/index';

// Note: The legacy admin token system has been replaced by role-based authentication.
// Example:
// ```typescript
// const { requireRole } = await import('@/lib/auth');
// const isAdmin = await requireRole(['admin']);
// ```

import { requireRole } from './auth/validation';
import { AuthError, JWTPayload } from './authTypes';

/**
 * Check if a user has admin privileges
 * @param userId - The ID of the user to check
 * @returns Promise<boolean> indicating if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const payload = await requireRole(['admin']);
    // Validate payload and userId match
    return payload && payload.userId === userId;
  } catch (error) {
    if (error instanceof AuthError) {
      console.warn(`Auth check failed: ${error.message}`);
    } else {
      console.error('Unexpected error during admin check:', error);
    }
    return false;
  }
}

/**
 * Validate an admin token
 * @param token - The token to validate
 * @returns Promise<JWTPayload>
 * @throws AuthError if token is invalid or user is not admin
 */
export async function validateAdminToken(token: string): Promise<JWTPayload> {
  if (!token) {
    throw new AuthError('INVALID_TOKEN', 'No token provided');
  }

  try {
    return await requireRole(['admin']);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('AUTH_ERROR', 'Failed to validate admin token');
  }
}

// These will be removed in future updates
/**
 * @deprecated Use requireRole instead
 */
export function getIsAdminFromHeaders(): boolean {
  console.warn(
    'getIsAdminFromHeaders is deprecated and will be removed. ' +
    'Use requireRole([\'admin\']) instead.'
  );
  return false;
}

// Export types for convenience
export type { UserRole, JWTPayload } from './authTypes';