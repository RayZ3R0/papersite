// Re-export all authentication functionality
export * from './auth/index';

// Note: The legacy admin token system has been replaced by role-based authentication.
// Use the new auth system with user roles: 'user', 'moderator', 'admin'
// 
// Example:
// ```typescript
// const { requireRole } = await import('@/lib/auth');
// const adminOnly = await requireRole(['admin']);
// ```

// For backwards compatibility, we keep these functions but they use the new system
import { requireRole } from './auth/validation';

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const payload = await requireRole(['admin']);
    return payload.userId === userId;
  } catch {
    return false;
  }
}

export async function validateAdminToken(userId: string): Promise<void> {
  await requireRole(['admin']);
}

// These will be removed in future updates
export function getIsAdminFromHeaders(): boolean {
  console.warn('getIsAdminFromHeaders is deprecated. Use requireRole instead.');
  return false;
}

// Export type for convenience
export type UserRole = 'user' | 'moderator' | 'admin';