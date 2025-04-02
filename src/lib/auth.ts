// Re-export all authentication functionality
export * from './auth/index';

// Note: The legacy admin token system has been replaced by role-based authentication.
// Example:
// ```typescript
// const { requireRole } = await import('@/lib/auth');
// const isAdmin = await requireRole(['admin']);
// ```

import { requireRole } from './auth/validation';
import { JWTPayload } from './authTypes';

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const payload = await requireRole(['admin']);
    // We know payload is valid at this point
    return payload.userId === userId;
  } catch {
    return false;
  }
}

export async function validateAdminToken(token: string): Promise<JWTPayload> {
  return requireRole(['admin']);
}

// These will be removed in future updates
export function getIsAdminFromHeaders(): boolean {
  console.warn('getIsAdminFromHeaders is deprecated. Use requireRole instead.');
  return false;
}

// Export types for convenience
export type { UserRole, JWTPayload } from './authTypes';