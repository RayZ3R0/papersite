import { NextRequest } from 'next/server';
import { AuthError } from '@/lib/authTypes';
import { createSecureResponse } from './headers';

interface RateLimitConfig {
  maxRequests: number;      // Maximum requests allowed
  windowMs: number;         // Time window in milliseconds
  blockDuration: number;    // How long to block if limit exceeded (ms)
}

// Store rate limit data in memory (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

// Default configurations for different routes
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,   // 15 minutes
    blockDuration: 30 * 60 * 1000 // 30 minutes
  },
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,    // 1 hour
    blockDuration: 24 * 60 * 60 * 1000 // 24 hours
  },
  profile: {
    maxRequests: 30,
    windowMs: 60 * 1000,        // 1 minute
    blockDuration: 5 * 60 * 1000 // 5 minutes
  },
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000,        // 1 minute
    blockDuration: 5 * 60 * 1000 // 5 minutes
  }
};

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // Get first IP if multiple are present
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to raw IP
  return request.ip || '127.0.0.1';
}

/**
 * Generate rate limit key from request
 */
function getRateLimitKey(request: NextRequest, route: string): string {
  const ip = getClientIp(request);
  return `${route}:${ip}`;
}

/**
 * Clean up expired entries periodically
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now && (!data.blockedUntil || data.blockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  route: keyof typeof rateLimitConfigs = 'default'
) {
  const config = rateLimitConfigs[route];
  const key = getRateLimitKey(request, route);
  const now = Date.now();

  // Get or create rate limit data
  let limitData = rateLimitStore.get(key);
  if (!limitData || limitData.resetTime < now) {
    limitData = { count: 0, resetTime: now + config.windowMs };
  }

  // Check if currently blocked
  if (limitData.blockedUntil && limitData.blockedUntil > now) {
    const timeLeft = Math.ceil((limitData.blockedUntil - now) / 1000);
    throw new AuthError(
      'RATE_LIMIT',
      `Too many requests. Please try again in ${timeLeft} seconds`,
      timeLeft
    );
  }

  // Increment counter
  limitData.count++;

  // Check if limit exceeded
  if (limitData.count > config.maxRequests) {
    limitData.blockedUntil = now + config.blockDuration;
    rateLimitStore.set(key, limitData);
    throw new AuthError(
      'RATE_LIMIT',
      'Too many requests. Please try again later',
      Math.ceil(config.blockDuration / 1000)
    );
  }

  // Update store
  rateLimitStore.set(key, limitData);

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': (config.maxRequests - limitData.count).toString(),
    'X-RateLimit-Reset': Math.ceil(limitData.resetTime / 1000).toString()
  };

  return headers;
}

/**
 * Rate limit middleware
 */
export async function rateLimit(
  request: NextRequest,
  route: keyof typeof rateLimitConfigs = 'default'
) {
  try {
    const headers = await checkRateLimit(request, route);
    return { success: true, headers };
  } catch (error) {
    if (error instanceof AuthError && error.code === 'RATE_LIMIT') {
      return {
        success: false,
        response: createSecureResponse(
          { 
            error: error.message,
            retryAfter: error.retryAfter 
          },
          429,
          'api'
        )
      };
    }
    throw error;
  }
}