import { UserWithoutPassword } from '../authTypes';

export type ForumAction = 'create' | 'edit' | 'delete' | 'pin' | 'lock';

interface ActionPermissions {
  postActions: ForumAction[];
  replyActions: ForumAction[];
}

/**
 * Get allowed actions based on user role and ownership
 */
export function getForumPermissions(
  user: UserWithoutPassword | null, 
  authorId?: string
): ActionPermissions {
  const isOwner = user?._id === authorId;
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  // Default permissions (no user/not logged in)
  const permissions: ActionPermissions = {
    postActions: [],
    replyActions: []
  };

  if (!user) return permissions;

  // Basic user permissions
  permissions.postActions = ['create'];
  permissions.replyActions = ['create'];

  // Owner permissions
  if (isOwner) {
    permissions.postActions.push('edit', 'delete');
    permissions.replyActions.push('edit', 'delete');
  }

  // Moderator permissions
  if (isModerator) {
    permissions.postActions.push('lock', 'edit');
    permissions.replyActions.push('delete');
  }

  // Admin permissions
  if (isAdmin) {
    permissions.postActions = ['create', 'edit', 'delete', 'pin', 'lock'];
    permissions.replyActions = ['create', 'edit', 'delete'];
  }

  return permissions;
}

/**
 * Check if user can perform a specific action
 */
export function canPerformAction(
  action: ForumAction,
  user: UserWithoutPassword | null,
  authorId?: string,
  type: 'post' | 'reply' = 'post'
): boolean {
  const permissions = getForumPermissions(user, authorId);
  return type === 'post' 
    ? permissions.postActions.includes(action)
    : permissions.replyActions.includes(action);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}