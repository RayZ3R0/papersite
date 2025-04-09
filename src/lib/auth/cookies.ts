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

function getCookieValue(cookieName: string) {
  // Check if we're in a browser context
  if (typeof document !== 'undefined') {
    const value = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
    return value ? value.pop() : '';
  }
  // Server context
  return cookies().get(cookieName)?.value;
}

export class AuthCookieManager {
  static getTokens() {
    return {
      accessToken: getCookieValue(ACCESS_TOKEN_KEY),
      refreshToken: getCookieValue(REFRESH_TOKEN_KEY),
    };
  }

  static setTokens(accessToken: string, refreshToken: string, rememberMe?: boolean) {
    // Default to remembering user (setting to true improves persistence)
    const effectiveRememberMe = rememberMe !== false;
    
    // Always use the longer duration for refresh token
    const refreshMaxAge = effectiveRememberMe ? DURATIONS.rememberMe : DURATIONS.refreshToken;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      priority: 'high',
    } as const;

    // In browser context
    if (typeof document !== 'undefined') {
      document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; max-age=${DURATIONS.accessToken}; path=/; ${cookieOptions.secure ? 'secure;' : ''} samesite=lax;`;
      document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; max-age=${refreshMaxAge}; path=/; ${cookieOptions.secure ? 'secure;' : ''} samesite=lax;`;
      if (effectiveRememberMe) {
        document.cookie = `${REMEMBER_ME_KEY}=true; max-age=${DURATIONS.rememberMe}; path=/; ${cookieOptions.secure ? 'secure;' : ''} samesite=lax;`;
      } else {
        document.cookie = `${REMEMBER_ME_KEY}=; max-age=0; path=/;`;
      }
      return;
    }

    // Server context
    const cookieStore = cookies();
    
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
      ...cookieOptions,
      maxAge: DURATIONS.accessToken,
      expires: new Date(Date.now() + DURATIONS.accessToken * 1000),
    });

    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAge,
      expires: new Date(Date.now() + refreshMaxAge * 1000),
    });

    if (effectiveRememberMe) {
      cookieStore.set(REMEMBER_ME_KEY, 'true', {
        ...cookieOptions,
        maxAge: DURATIONS.rememberMe,
        expires: new Date(Date.now() + DURATIONS.rememberMe * 1000),
      });
    } else {
      cookieStore.delete(REMEMBER_ME_KEY);
    }
  }

  static clearTokens() {
    // In browser context
    if (typeof document !== 'undefined') {
      document.cookie = `${ACCESS_TOKEN_KEY}=; max-age=0; path=/;`;
      document.cookie = `${REFRESH_TOKEN_KEY}=; max-age=0; path=/;`;
      document.cookie = `${REMEMBER_ME_KEY}=; max-age=0; path=/;`;
      return;
    }

    // Server context
    const cookieStore = cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    cookieStore.delete(REMEMBER_ME_KEY);
  }

  static getTokenHeader() {
    const { accessToken } = this.getTokens();
    return accessToken ? `Bearer ${accessToken}` : undefined;
  }

  static isRemembered() {
    return getCookieValue(REMEMBER_ME_KEY) === 'true';
  }
}