import { cookies } from 'next/headers';
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';
const SESSION_ID_KEY = 'session_id';

// Extended cookie durations for maximum persistence
const DURATIONS = {
  accessToken: 7 * 24 * 60 * 60, // 7 days for better persistence
  refreshToken: 90 * 24 * 60 * 60, // 90 days for long-term sessions
  rememberMe: 365 * 24 * 60 * 60, // 1 year for remember me
  sessionId: 90 * 24 * 60 * 60 // 90 days for session tracking
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
      sessionId: getCookieValue(SESSION_ID_KEY)
    };
  }

  // Generate a unique session ID
  static generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static setTokens(accessToken: string, refreshToken: string, rememberMe?: boolean) {
    // Always use remember me for better persistence
    const effectiveRememberMe = true;
    
    // Use the longest duration for refresh token
    const refreshMaxAge = DURATIONS.rememberMe;

    // Generate a new session ID if one doesn't exist
    const existingSessionId = getCookieValue(SESSION_ID_KEY);
    const sessionId = existingSessionId || this.generateSessionId();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      priority: 'high',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
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
      const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
      const domainStr = domain ? `domain=${domain};` : '';
      document.cookie = `${ACCESS_TOKEN_KEY}=; max-age=0; path=/; ${domainStr}`;
      document.cookie = `${REFRESH_TOKEN_KEY}=; max-age=0; path=/; ${domainStr}`;
      document.cookie = `${REMEMBER_ME_KEY}=; max-age=0; path=/; ${domainStr}`;
      document.cookie = `${SESSION_ID_KEY}=; max-age=0; path=/; ${domainStr}`;
      return;
    }

    // Server context
    const cookieStore = cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    cookieStore.delete(REMEMBER_ME_KEY);
    cookieStore.delete(SESSION_ID_KEY);
  }

  static getTokenHeader() {
    const { accessToken } = this.getTokens();
    return accessToken ? `Bearer ${accessToken}` : undefined;
  }

  static isRemembered() {
    return getCookieValue(REMEMBER_ME_KEY) === 'true';
  }
}