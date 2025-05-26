import { NextRequest } from 'next/server';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitData {
  count: number;
  lastReset: number;
}

const cache = new Map<string, RateLimitData>();

export default function rateLimit(options: RateLimitOptions) {
  return {
    check: async (request: NextRequest, limit: number, token: string) => {
      // Use IP address and user agent for rate limiting
      const ip = request.ip || 
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') || 
        'unknown';
      
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const key = `${token}:${ip}:${userAgent.slice(0, 50)}`;
      
      const now = Date.now();
      const data = cache.get(key) || { count: 0, lastReset: now };
      
      // Reset counter if interval has passed
      if (now - data.lastReset > options.interval) {
        data.count = 0;
        data.lastReset = now;
      }
      
      data.count++;
      cache.set(key, data);
      
      // Clean up old entries periodically
      if (cache.size > options.uniqueTokenPerInterval) {
        const cutoff = now - options.interval;
        for (const [cacheKey, cacheData] of cache.entries()) {
          if (cacheData.lastReset < cutoff) {
            cache.delete(cacheKey);
          }
        }
      }
      
      if (data.count > limit) {
        const error = new Error('Rate limit exceeded');
        error.name = 'RateLimitError';
        throw error;
      }
      
      return { success: true };
    }
  };
}