// Time windows for user actions (in milliseconds)
export const TIME_WINDOWS = {
  DELETE: 15 * 60 * 1000, // 15 minutes
  EDIT: 15 * 60 * 1000,   // 15 minutes
  RATE_LIMIT: 60 * 60 * 1000 // 1 hour
};

// Verify user has rights to modify content
export function canModifyContent(
  content: { authorId: string; ip: string; createdAt: Date },
  userId: string,
  userIp: string,
  isDelete: boolean = false
): { allowed: boolean; reason?: string } {
  // Check user ID matches
  if (content.authorId !== userId) {
    return { allowed: false, reason: 'Unauthorized' };
  }

  // Check IP matches
  if (content.ip !== userIp) {
    return { allowed: false, reason: 'IP address does not match' };
  }

  // Check time window
  const timeWindow = isDelete ? TIME_WINDOWS.DELETE : TIME_WINDOWS.EDIT;
  if (Date.now() - content.createdAt.getTime() > timeWindow) {
    const action = isDelete ? 'deleted' : 'edited';
    return {
      allowed: false,
      reason: `Content can only be ${action} within ${timeWindow / 60000} minutes of creation`
    };
  }

  return { allowed: true };
}

// Clean user-generated content
export function sanitizeContent(content: string): string {
  return content
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 10000); // Enforce max length
}

// Clean user-generated titles
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 200);
}

// Clean tags
export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
    .filter(tag => tag.length > 0 && tag.length <= 30)
    .slice(0, 5); // Maximum 5 tags
}

// Rate limit check (to be used with Redis in production)
export function checkRateLimit(
  key: string,
  limit: number,
  window: number = TIME_WINDOWS.RATE_LIMIT
): boolean {
  // This is a placeholder for actual rate limiting logic
  // In production, use Redis or similar to track request counts
  return true;
}