import { cookies } from 'next/headers';
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';

// Increased cookie durations for better persistence
const DURATIONS = {
  accessToken: 24 * 60 * 60, // 24 hours (increased from 4 hours)
  refreshToken: 30 * 24 * 60 * 60, // 30 days (increased from 7 days)
  rememberMe: 180 * 24 * 60 * 60 // 180 days (increased from 90 days)
} as const;

export class AuthCookieManager {
  static getTokens() {
    const cookieStore = cookies();
    return {
      accessToken: cookieStore.get(ACCESS_TOKEN_KEY)?.value,
      refreshToken: cookieStore.get(REFRESH_TOKEN_KEY)?.value,
    };
  }

  static setTokens(accessToken: string, refreshToken: string, rememberMe?: boolean) {
    const cookieStore = cookies();
    
    // Default to remembering user (setting to true improves persistence)
    const effectiveRememberMe = rememberMe !== false;
    
    // Always use the longer duration for refresh token
    const refreshMaxAge = effectiveRememberMe ? DURATIONS.rememberMe : DURATIONS.refreshToken;

    // Set access token with longer duration
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: DURATIONS.accessToken,
      path: '/',
      priority: 'high',
      // Adding expires for better browser compatibility
      expires: new Date(Date.now() + DURATIONS.accessToken * 1000),
    });

    // Set refresh token with much longer expiry
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/',
      priority: 'high',
      // Remove partitioned property as it's not recognized
      // Adding expires for better browser compatibility
      expires: new Date(Date.now() + refreshMaxAge * 1000),
    });

    // Always set remember me cookie unless explicitly disabled
    if (effectiveRememberMe) {
      cookieStore.set(REMEMBER_ME_KEY, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: DURATIONS.rememberMe,
        path: '/',
        // Remove partitioned property as it's not recognized
        // Adding expires for better browser compatibility
        expires: new Date(Date.now() + DURATIONS.rememberMe * 1000),
      });
    } else {
      cookieStore.delete(REMEMBER_ME_KEY);
    }
  }

  static clearTokens() {
    const cookieStore = cookies();
    
    // Fix delete method calls - should only pass the key
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    cookieStore.delete(REMEMBER_ME_KEY);
  }

  static getTokenHeader() {
    const { accessToken } = this.getTokens();
    return accessToken ? `Bearer ${accessToken}` : undefined;
  }

  static isRemembered() {
    const cookieStore = cookies();
    return cookieStore.get(REMEMBER_ME_KEY)?.value === 'true';
  }
}