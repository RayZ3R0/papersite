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

// Get allowed domains from environment
const ALLOWED_DOMAINS = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(',') || [];
const VERCEL_DOMAIN = process.env.NEXT_PUBLIC_VERCEL_DOMAIN;
const CUSTOM_DOMAIN = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN;

// Get domain from request for multi-domain support
function getCookieDomain(requestHost?: string): string | undefined {
  if (!requestHost) return undefined;
  
  // Development environment
  if (process.env.NODE_ENV === 'development') {
    return undefined; // Use default domain behavior
  }

  // Production environment
  if (ALLOWED_DOMAINS.includes(requestHost)) {
    // Handle Vercel domains
    if (requestHost.endsWith('.vercel.app') && VERCEL_DOMAIN) {
      return VERCEL_DOMAIN;
    }

    // Handle custom domain
    if (CUSTOM_DOMAIN && requestHost === CUSTOM_DOMAIN) {
      return CUSTOM_DOMAIN;
    }
  }

  // Preview deployments and other cases
  if (requestHost.endsWith('.vercel.app')) {
    return requestHost; // Use full domain for preview deployments
  }

  // Default to undefined which will set cookie on current domain
  return undefined;
}

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
      sameSite: 'lax' as const,
      path: '/',
      priority: 'high' as const,
    };

    // In browser context
    if (typeof document !== 'undefined') {
      const domain = getCookieDomain(window.location.hostname);
      const domainStr = domain ? `domain=${domain};` : '';
      
      document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; max-age=${DURATIONS.accessToken}; path=/; ${cookieOptions.secure ? 'secure;' : ''} samesite=lax; ${domainStr}`;
      document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; max-age=${refreshMaxAge}; path=/; ${cookieOptions.secure ? 'secure;' : ''} samesite=lax; ${domainStr}`;
      if (effectiveRememberMe) {
        document.cookie = `${REMEMBER_ME_KEY}=true; max-age=${DURATIONS.rememberMe}; path=/; ${cookieOptions.secure ? 'secure;' : ''} samesite=lax; ${domainStr}`;
      } else {
        document.cookie = `${REMEMBER_ME_KEY}=; max-age=0; path=/; ${domainStr}`;
      }
      return;
    }

    // Server context
    const cookieStore = cookies();
    const requestHeaders = new Headers();
    const domain = getCookieDomain(requestHeaders.get('host') || undefined);
    
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
      ...cookieOptions,
      maxAge: DURATIONS.accessToken,
      expires: new Date(Date.now() + DURATIONS.accessToken * 1000),
      domain
    });

    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAge,
      expires: new Date(Date.now() + refreshMaxAge * 1000),
      domain
    });

    if (effectiveRememberMe) {
      cookieStore.set(REMEMBER_ME_KEY, 'true', {
        ...cookieOptions,
        maxAge: DURATIONS.rememberMe,
        expires: new Date(Date.now() + DURATIONS.rememberMe * 1000),
        domain
      });
    } else {
      cookieStore.set(REMEMBER_ME_KEY, '', {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0),
        domain
      });
    }
  }

  static clearTokens() {
    // In browser context
    if (typeof document !== 'undefined') {
      const domain = getCookieDomain(window.location.hostname);
      const domainStr = domain ? `domain=${domain};` : '';
      
      document.cookie = `${ACCESS_TOKEN_KEY}=; max-age=0; path=/; ${domainStr}`;
      document.cookie = `${REFRESH_TOKEN_KEY}=; max-age=0; path=/; ${domainStr}`;
      document.cookie = `${REMEMBER_ME_KEY}=; max-age=0; path=/; ${domainStr}`;
      document.cookie = `${SESSION_ID_KEY}=; max-age=0; path=/; ${domainStr}`;
      return;
    }

    // Server context
    const cookieStore = cookies();
    const requestHeaders = new Headers();
    const domain = getCookieDomain(requestHeaders.get('host') || undefined);

    const baseOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      domain,
      maxAge: 0,
      expires: new Date(0)
    };

    // Set empty values with immediate expiry to delete cookies
    cookieStore.set(ACCESS_TOKEN_KEY, '', baseOptions);
    cookieStore.set(REFRESH_TOKEN_KEY, '', baseOptions);
    cookieStore.set(REMEMBER_ME_KEY, '', baseOptions);
    cookieStore.set(SESSION_ID_KEY, '', baseOptions);
  }

  static getTokenHeader() {
    const { accessToken } = this.getTokens();
    return accessToken ? `Bearer ${accessToken}` : undefined;
  }

  static isRemembered() {
    return getCookieValue(REMEMBER_ME_KEY) === 'true';
  }
}