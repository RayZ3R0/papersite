import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is not defined');
}

export type UserRole = 'user' | 'moderator' | 'admin';

export interface JWTPayload {
  _id?: string;       // Optional for backward compatibility
  userId: string;     // Main identifier
  username: string;
  email: string;
  role: UserRole;
  jti?: string;
  iat?: number;
  exp?: number;
  // Optional fields for compatibility with UserWithoutPassword
  createdAt?: Date;
  banned?: boolean;
  verified?: boolean;
  lastLogin?: Date;
}

export interface TokenResponse {
  token: string;
  expiresAt: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function isValidRole(role: string): role is UserRole {
  return ['user', 'moderator', 'admin'].includes(role);
}

export async function signToken(payload: JWTPayload): Promise<TokenResponse> {
  try {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 24 * 60 * 60; // 24 hours
    const jti = crypto.randomUUID();

    const token = await new SignJWT({
      ...payload,
      iat,
      exp,
      jti,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(jti)
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(new TextEncoder().encode(JWT_SECRET));

    return {
      token,
      expiresAt: exp,
    };
  } catch (error) {
    console.error('Error signing token:', error);
    throw new Error('Failed to sign token');
  }
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ['HS256'],
      }
    );

    // Ensure required fields are present
    if (!payload.userId || !payload.username || !payload.email || !payload.role) {
      throw new Error('Invalid token payload');
    }

    // Validate role
    if (!isValidRole(payload.role as string)) {
      throw new Error('Invalid user role');
    }

    // Ensure _id is always present by using userId if _id is not provided
    const verifiedPayload: JWTPayload = {
      userId: payload.userId as string,
      username: payload.username as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      _id: (payload._id || payload.userId) as string, // Use userId as fallback
      jti: payload.jti as string,
      iat: payload.iat,
      exp: payload.exp,
      createdAt: payload.createdAt as Date || new Date(),
      banned: payload.banned as boolean || false,
      verified: payload.verified as boolean || false,
      lastLogin: payload.lastLogin as Date || new Date()
    };
    
    return verifiedPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}

export async function getToken(name = 'token'): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get(name)?.value || null;
}

export async function getTokensFromCookies(): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    getToken('token'),
    getToken('refreshToken')
  ]);

  return {
    accessToken: accessToken || '',
    refreshToken: refreshToken || ''
  };
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    return await verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}