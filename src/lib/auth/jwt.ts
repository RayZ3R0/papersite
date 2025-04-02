import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWTPayload } from '@/lib/authTypes';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set in environment variables');
}

// Generate access token
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET);

  return token;
}

// Generate refresh token
export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(SECRET);

  return token;
}

// Verify token
export async function verifyToken<T = JWTPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as T;
  } catch (error) {
    return null;
  }
}

// Set token cookies
export function setTokenCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  const secure = process.env.NODE_ENV === 'production';

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear token cookies
export function clearTokenCookies() {
  const cookieStore = cookies();
  const secure = process.env.NODE_ENV === 'production';

  cookieStore.set('access_token', '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  cookieStore.set('refresh_token', '', {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

// Get tokens from cookies
export function getTokensFromCookies() {
  const cookieStore = cookies();
  
  return {
    accessToken: cookieStore.get('access_token')?.value,
    refreshToken: cookieStore.get('refresh_token')?.value,
  };
}

// Set single cookie (utility function)
export function setCookie(
  name: string,
  value: string,
  options: { maxAge?: number; path?: string; } = {}
) {
  const cookieStore = cookies();
  const secure = process.env.NODE_ENV === 'production';

  cookieStore.set(name, value, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    ...options,
  });
}