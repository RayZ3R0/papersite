import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_ME_KEY = 'remember_me';

// Cookie durations
const DURATIONS = {
  accessToken: 15 * 60, // 15 minutes
  refreshToken: 24 * 60 * 60, // 24 hours
  rememberMe: 30 * 24 * 60 * 60 // 30 days
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
    const refreshMaxAge = rememberMe ? DURATIONS.rememberMe : DURATIONS.refreshToken;

    // Set access token (short-lived)
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: DURATIONS.accessToken,
      path: '/',
    });

    // Set refresh token (long-lived if remember me is enabled)
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });

    // Set remember me cookie if enabled
    if (rememberMe) {
      cookieStore.set(REMEMBER_ME_KEY, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: DURATIONS.rememberMe,
        path: '/',
      });
    } else {
      cookieStore.delete(REMEMBER_ME_KEY);
    }
  }

  static clearTokens() {
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
    const cookieStore = cookies();
    return cookieStore.get(REMEMBER_ME_KEY)?.value === 'true';
  }
}