import { cookies } from 'next/headers';
import { serialize, SerializeOptions } from 'cookie';

interface CookieOptions extends SerializeOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  expires?: Date;
  sameSite?: 'strict' | 'lax' | 'none';
}

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// Server-side cookie operations
export class ServerCookieManager {
  static set(name: string, value: string, options: CookieOptions = {}) {
    const cookieStore = cookies();
    cookieStore.set(name, value, {
      ...DEFAULT_OPTIONS,
      ...options,
    });
  }

  static get(name: string) {
    const cookieStore = cookies();
    return cookieStore.get(name);
  }

  static delete(name: string) {
    const cookieStore = cookies();
    cookieStore.delete(name);
  }

  static getAll() {
    const cookieStore = cookies();
    return cookieStore.getAll();
  }
}

// Client-side cookie operations
export class ClientCookieManager {
  static set(name: string, value: string, options: CookieOptions = {}) {
    const cookieString = serialize(name, value, {
      ...DEFAULT_OPTIONS,
      ...options,
    });
    if (typeof document !== 'undefined') {
      document.cookie = cookieString;
    }
  }

  static get(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
  }

  static delete(name: string) {
    this.set(name, '', { maxAge: 0 });
  }

  static getAll(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    return document.cookie.split(';').reduce((acc, curr) => {
      const [key, value] = curr.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);
  }
}

// Auth-specific cookie operations
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  RETURN_TO: 'return_to',
} as const;

export class AuthCookieManager {
  static setTokens(accessToken: string, refreshToken: string) {
    ServerCookieManager.set(AUTH_COOKIES.ACCESS_TOKEN, accessToken, {
      maxAge: 60 * 60, // 1 hour
    });

    ServerCookieManager.set(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  static clearTokens() {
    ServerCookieManager.delete(AUTH_COOKIES.ACCESS_TOKEN);
    ServerCookieManager.delete(AUTH_COOKIES.REFRESH_TOKEN);
  }

  static getTokens() {
    return {
      accessToken: ServerCookieManager.get(AUTH_COOKIES.ACCESS_TOKEN)?.value,
      refreshToken: ServerCookieManager.get(AUTH_COOKIES.REFRESH_TOKEN)?.value,
    };
  }

  static setReturnTo(url: string) {
    ServerCookieManager.set(AUTH_COOKIES.RETURN_TO, url, {
      maxAge: 60 * 5, // 5 minutes
    });
  }

  static getReturnTo() {
    return ServerCookieManager.get(AUTH_COOKIES.RETURN_TO)?.value;
  }

  static clearReturnTo() {
    ServerCookieManager.delete(AUTH_COOKIES.RETURN_TO);
  }
}

export default {
  ServerCookieManager,
  ClientCookieManager,
  AuthCookieManager,
};