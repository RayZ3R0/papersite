import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthError, JWTPayload } from '@/lib/authTypes';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

export async function signAccessToken(payload: Omit<JWTPayload, 'exp' | 'iat'>) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(SECRET);
  return jwt;
}

export async function signRefreshToken(payload: Omit<JWTPayload, 'exp' | 'iat'>) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(SECRET);
  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    
    // Validate required fields
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.username !== 'string' ||
      !['user', 'moderator', 'admin'].includes(payload.role as string)
    ) {
      throw new AuthError('INVALID_TOKEN', 'Invalid token payload');
    }

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as 'user' | 'moderator' | 'admin',
      exp: payload.exp,
      iat: payload.iat
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('INVALID_TOKEN', 'Invalid or expired token');
  }
}