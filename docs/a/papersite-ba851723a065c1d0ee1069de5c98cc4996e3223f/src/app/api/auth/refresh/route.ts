import { NextRequest, NextResponse } from 'next/server';
import { AuthCookieManager } from '@/lib/auth';
import { AuthError, AUTH_ERRORS, TokenResponse, UserWithoutPassword } from '@/lib/authTypes';
import { refreshUserToken } from '@/lib/auth';
import { ObjectId } from 'mongoose';
import { withDb } from '@/lib/api-middleware';

// Configure runtime and performance settings
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 5;
export const revalidate = 0;

// Connection options for better reliability
const connectionOptions = {
  maxRetries: 2, // Fewer retries for token refresh
  retryDelay: 500, // Faster retries for better UX
  validateConnection: true
};

// Helper to safely format date
function formatDate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString();
  return date;
}

// Helper to format user data
function formatUserData(userData: any): UserWithoutPassword {
  return {
    _id: typeof userData._id.toString === 'function' ? userData._id.toString() : userData._id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    verified: userData.verified,
    createdAt: formatDate(userData.createdAt) || new Date().toISOString(),
    lastLogin: formatDate(userData.lastLogin),
    loginCount: userData.loginCount,
    verificationAttempts: userData.verificationAttempts,
    resetPasswordAttempts: userData.resetPasswordAttempts,
    lockoutUntil: formatDate(userData.lockoutUntil)
  };
}

export const POST = withDb(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id');
  
  try {
    const { refreshToken, sessionId } = AuthCookieManager.getTokens();
    
    // Validate refresh token
    if (!refreshToken) {
      return NextResponse.json(
        {
          error: AUTH_ERRORS.INVALID_TOKEN,
          code: 'INVALID_TOKEN',
          message: 'No refresh token available',
          ...(requestId && { requestId })
        },
        { status: 401 }
      );
    }
    
    // Attempt to refresh with retry logic
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await refreshUserToken(refreshToken, true);
        
        if (!result?.user) {
          throw new AuthError('INVALID_TOKEN', 'Invalid refresh token');
        }

        // Get request tracking ID, ensuring it's string or undefined
        const reqId = requestId || undefined;

        // Prepare response with sanitized and formatted data
        const response: TokenResponse = {
          success: true,
          user: formatUserData(result.user),
          sessionInfo: {
            lastRefresh: new Date().toISOString(),
            sessionId
          },
          ...(reqId || attempt > 0) && {
            metadata: {
              ...(attempt > 0 && { attempt: attempt + 1 }),
              ...(reqId && { requestId: reqId })
            }
          }
        };

        return NextResponse.json(response);
      } catch (error) {
        lastError = error;
        if (error instanceof AuthError && error.code !== 'SERVER_ERROR') {
          // Don't retry on auth errors except server errors
          break;
        }
        if (attempt < 1) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // If we reach here, all retries failed
    throw lastError || new AuthError('SERVER_ERROR', 'Failed to refresh token');
  } catch (error) {
    console.error('Token refresh error:', error);

    // Enhanced error handling with retry information
    if (error instanceof AuthError) {
      const status =
        error.code === 'SERVER_ERROR' ? 500 :
        error.code === 'RATE_LIMIT' ? 429 :
        401;

      const headers: Record<string, string> = {};
      if (error.code === 'RATE_LIMIT' && error.retryAfter) {
        headers['Retry-After'] = error.retryAfter.toString();
      }

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          ...(error.retryAfter && { retryAfter: error.retryAfter }),
          ...(requestId && { requestId })
        },
        {
          status,
          headers: Object.keys(headers).length > 0 ? headers : undefined
        }
      );
    }

    return NextResponse.json(
      {
        error: AUTH_ERRORS.SERVER_ERROR,
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred during token refresh',
        ...(requestId && { requestId })
      },
      { status: 500 }
    );
  }
}, connectionOptions);

// Handle preflight requests
export const OPTIONS = () => new NextResponse(null, {
  status: 204,
  headers: {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Max-Age': '86400',
  },
});