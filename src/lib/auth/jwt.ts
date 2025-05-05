import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthError, JWTPayload } from '@/lib/authTypes';
import { SECURITY_CONFIG } from './config';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Use consistent token expiry from security config
const { accessTokenExpiry, refreshTokenExpiry, algorithm } = SECURITY_CONFIG.tokens;

// Time unit to seconds mapping
const TIME_UNITS: Record<string, number> = {
  's': 1,      // seconds
  'm': 60,     // minutes
  'h': 3600,   // hours
  'd': 86400   // days
};

// Add jitter to prevent token renewal storms
function getExpiryWithJitter(baseExpiry: string): string {
  const jitterRange = 60; // 1 minute max jitter
  const jitter = Math.floor(Math.random() * jitterRange);
  
  return baseExpiry.replace(/(\d+)([dhms])/, (_, num: string, unit: string) => {
    const multiplier = TIME_UNITS[unit] || 1;
    return `${parseInt(num) * multiplier + jitter}s`;
  });
}

export async function signAccessToken(payload: Omit<JWTPayload, 'exp' | 'iat' | 'jti'>) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setExpirationTime(getExpiryWithJitter(accessTokenExpiry))
    .setIssuedAt()
    .setJti(crypto.randomUUID()) // Add unique token ID
    .sign(SECRET);
  return jwt;
}

export async function signRefreshToken(payload: Omit<JWTPayload, 'exp' | 'iat' | 'jti'>) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setExpirationTime(getExpiryWithJitter(refreshTokenExpiry))
    .setIssuedAt()
    .setJti(crypto.randomUUID()) // Add unique token ID
    .sign(SECRET);
  return jwt;
}

export async function verifyToken(token: string, correlationId?: string): Promise<JWTPayload> {
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

    // Calculate time until expiry for logging
    const timeUntilExpiry = ((payload.exp || 0) * 1000) - Date.now();
    if (correlationId) {
      console.debug(`Token verification (${correlationId}):`, {
        username: payload.username,
        role: payload.role,
        expiresIn: Math.floor(timeUntilExpiry / 1000),
        tokenId: payload.jti
      });
    }

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as 'user' | 'moderator' | 'admin',
      exp: payload.exp,
      iat: payload.iat,
      jti: payload.jti as string
    };
  } catch (error) {
    const errorDetails = {
      correlationId,
      tokenStart: token.slice(0, 10) + '...',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    console.error('Token verification failed:', errorDetails);
    
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('INVALID_TOKEN', 'Invalid or expired token');
  }
}