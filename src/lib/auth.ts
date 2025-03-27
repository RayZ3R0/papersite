import { headers } from 'next/headers';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.warn('ADMIN_TOKEN is not set in environment variables');
}

export function isAdmin(token?: string): boolean {
  if (!ADMIN_TOKEN) return false;
  if (!token) return false;
  return token === ADMIN_TOKEN;
}

export function getIsAdminFromHeaders(): boolean {
  const headersList = headers();
  const adminToken = headersList.get('X-Admin-Token');
  return isAdmin(adminToken || undefined);
}

export function validateAdminToken(token?: string): void {
  if (!isAdmin(token)) {
    throw new Error('Unauthorized');
  }
}