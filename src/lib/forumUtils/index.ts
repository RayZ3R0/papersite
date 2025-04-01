import { UserTokenPayload, UserWithoutPassword } from '@/lib/authTypes';
import { UserRole } from '@/lib/auth/jwt';

type ActionType = 'edit' | 'delete' | 'pin' | 'lock';
type ContentType = 'post' | 'reply';

const roleHierarchy: Record<UserRole, number> = {
  'admin': 3,
  'moderator': 2,
  'user': 1
};

/**
 * Check if user has required fields for auth
 */
function isValidAuthUser(user: UserWithoutPassword | UserTokenPayload | null): user is (UserWithoutPassword | UserTokenPayload) {
  return !!user && (
    // Check for UserWithoutPassword
    ('_id' in user && typeof user._id === 'string' && typeof user.role === 'string') ||
    // Check for UserTokenPayload
    ('userId' in user && typeof user.userId === 'string' && typeof user.role === 'string')
  );
}

/**
 * Check if a user can perform an action on a forum post or reply
 */
export function canPerformAction(
  action: ActionType,
  user: UserWithoutPassword | UserTokenPayload | null,
  authorId: string,
  type: ContentType
): boolean {
  // Validate auth user
  if (!isValidAuthUser(user)) return false;

  // Admin can do anything
  if (roleHierarchy[user.role] === roleHierarchy.admin) {
    return true;
  }

  // Moderators can delete/lock any content
  if (roleHierarchy[user.role] >= roleHierarchy.moderator) {
    if (action === 'delete' || action === 'lock') {
      return true;
    }
  }

  // Only admins can pin posts
  if (action === 'pin') {
    return roleHierarchy[user.role] === roleHierarchy.admin;
  }

  // Authors can edit/delete their own content
  const userId = 'userId' in user ? user.userId : user._id;
  if ((action === 'edit' || action === 'delete') && userId === authorId) {
    return true;
  }

  return false;
}

/**
 * Format a date for display in the forum
 * 
 * Examples:
 * - "just now" (less than a minute ago)
 * - "5m ago" (less than an hour ago)
 * - "2h ago" (less than a day ago)
 * - "3d ago" (less than a week ago)
 * - "Mar 15, 2025" (older than a week)
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  
  // Less than a minute ago
  if (diff < minute) {
    return 'just now';
  }
  
  // Less than an hour ago
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}m ago`;
  }
  
  // Less than a day ago
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }
  
  // Less than a week ago
  if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }
  
  // Format as full date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Check if a post/reply is old enough to be edited
 * (prevents edits after 24 hours)
 */
export function canEdit(date: string | Date): boolean {
  const editWindow = 24 * 60 * 60 * 1000; // 24 hours
  const created = new Date(date);
  const now = new Date();
  return now.getTime() - created.getTime() < editWindow;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Check if user has the required role
 */
export function hasRole(
  user: UserWithoutPassword | UserTokenPayload | null,
  requiredRole: UserRole
): boolean {
  if (!isValidAuthUser(user)) return false;
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}