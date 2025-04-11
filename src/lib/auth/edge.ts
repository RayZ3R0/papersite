import { AuthError } from '../authTypes';
import { verifyToken } from './jwt';
import { AuthCookieManager } from './cookies';

/**
 * Edge-compatible auth functions that don't require database access
 */

export async function clearAuthTokens() {
  try {
    AuthCookieManager.clearTokens();
  } catch (error) {
    console.error('Clear tokens error:', error);
    throw new AuthError('SERVER_ERROR', 'Failed to clear auth tokens');
  }
}

export async function getAuthTokens() {
  return AuthCookieManager.getTokens();
}

export async function verifyAccessToken(token?: string) {
  try {
    // Get token from cookies if not provided
    if (!token) {
      const tokens = AuthCookieManager.getTokens();
      token = tokens.accessToken;
    }

    if (!token) {
      throw new AuthError('INVALID_TOKEN', 'No access token available');
    }

    return await verifyToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    throw new AuthError('INVALID_TOKEN', 'Invalid or expired token');
  }
}

export async function verifyRefreshToken(token?: string) {
  try {
    // Get token from cookies if not provided
    if (!token) {
      const tokens = AuthCookieManager.getTokens();
      token = tokens.refreshToken;
    }

    if (!token) {
      throw new AuthError('INVALID_TOKEN', 'No refresh token available');
    }

    return await verifyToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    throw new AuthError('INVALID_TOKEN', 'Invalid or expired token');
  }
}

export async function setAuthTokens(accessToken: string, refreshToken: string, rememberMe: boolean = true) {
  try {
    AuthCookieManager.setTokens(accessToken, refreshToken, rememberMe);
  } catch (error) {
    console.error('Set tokens error:', error);
    throw new AuthError('SERVER_ERROR', 'Failed to set auth tokens');
  }
}