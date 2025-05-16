/**
 * Cryptographic utilities using Web Crypto API for Edge compatibility
 */

/**
 * Generate a cryptographically secure random token
 * @param length Number of bytes (default: 32)
 * @returns Hex string of random bytes
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a secure hash of a string
 * @param input String to hash
 * @returns SHA-256 hash as hex string
 */
export async function hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare two strings in constant time to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns boolean indicating if strings are equal
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a random string of specified length
 * @param length Length of string to generate
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(array)
    .map(byte => validChars[byte % validChars.length])
    .join('');
}

/**
 * Create a secure session ID
 * @returns Random session ID
 */
export async function generateSessionId(): Promise<string> {
  const timestamp = Date.now().toString(36);
  const random = await generateSecureToken(16);
  return `${timestamp}-${random}`;
}

/**
 * Utility to safely compare hashes in constant time
 * @param storedHash The stored hash to compare against
 * @param computedHash The newly computed hash to compare
 * @returns boolean indicating if hashes match
 */
export function compareHashes(storedHash: string, computedHash: string): boolean {
  return constantTimeEqual(storedHash, computedHash);
}