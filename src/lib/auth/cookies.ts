import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class AuthCookieManager {
  static getTokens() {
    const cookieStore = cookies();
    return {
      accessToken: cookieStore.get(ACCESS_TOKEN_KEY)?.value,
      refreshToken: cookieStore.get(REFRESH_TOKEN_KEY)?.value,
    };
  }

  static setTokens(accessToken: string, refreshToken: string, maxAge?: number) {
    const cookieStore = cookies();

    // Set access token (short-lived)
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Set refresh token (long-lived)
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge || 24 * 60 * 60, // Default 24 hours or custom duration
      path: '/',
    });
  }

  static clearTokens() {
    const cookieStore = cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
  }

  static getTokenHeader() {
    const { accessToken } = this.getTokens();
    return accessToken ? `Bearer ${accessToken}` : undefined;
  }
}