import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './mongodb';
import { withLogging } from './api-logger';
import { Types } from 'mongoose';

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

interface ApiMiddlewareOptions {
  requireConnection?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  validateConnection?: boolean;
}

const DEFAULT_OPTIONS: ApiMiddlewareOptions = {
  requireConnection: true,
  maxRetries: 3,
  retryDelay: 1000,
  validateConnection: true
};

interface ApiResponse {
  success?: boolean;
  data?: any;
  error?: string | Record<string, any>;
  code?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Higher-order function to wrap API route handlers with database connection
 * and error handling
 */
export function withDb(handler: ApiHandler, options: ApiMiddlewareOptions = {}) {
  const handlerWithLogging = withLogging(handler);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async function (req: NextRequest) {
    let lastError: Error | null = null;
    let retries = opts.maxRetries || 2;
    
    while (retries >= 0) {
      try {
        // Try to connect to database with configured options
        await dbConnect({
          maxRetries: opts.maxRetries,
          retryDelay: opts.retryDelay,
          validateConnection: opts.validateConnection
        });
        
        // Execute the handler
        const response = await handlerWithLogging(req);
        return response;
        
      } catch (error: any) {
        lastError = error;
        console.error(`API Error (attempts left: ${retries}):`, error);
        
        // Handle MongoDB connection errors
        if (
          error?.name === 'MongoNetworkError' ||
          error?.name === 'MongoServerSelectionError' ||
          error?.name === 'MongooseServerSelectionError'
        ) {
          if (retries > 0) {
            retries--;
            // Wait before retrying with exponential backoff
            const delay = opts.retryDelay! * Math.pow(2, opts.maxRetries! - retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          console.error('MongoDB connection failed after retries:', error);
          return NextResponse.json(
            {
              error: 'Service temporarily unavailable',
              code: 'DB_CONNECTION_ERROR',
              retryAfter: opts.retryDelay
            },
            {
              status: 503,
              headers: {
                'Retry-After': Math.ceil(opts.retryDelay! / 1000).toString()
              }
            }
          );
        }

        // Handle validation errors
        if (error?.name === 'ValidationError') {
          return NextResponse.json(
            {
              error: error.message,
              code: 'VALIDATION_ERROR',
              details: error.errors
            },
            { status: 400 }
          );
        }

        // Handle auth errors
        if (error?.name === 'AuthError') {
          return NextResponse.json(
            {
              error: error.message,
              code: error.code || 'AUTH_ERROR'
            },
            { status: 401 }
          );
        }

        // Handle all other errors
        return NextResponse.json(
          {
            error: error?.message || 'An unexpected error occurred',
            code: error?.code || 'INTERNAL_ERROR',
            requestId: req.headers.get('x-request-id') || undefined
          },
          { status: 500 }
        );
      }
    }

    // This should never be reached due to the error handling above
    return NextResponse.json(
      {
        error: lastError?.message || 'Service temporarily unavailable',
        code: 'INTERNAL_ERROR',
        requestId: req.headers.get('x-request-id') || undefined
      },
      { status: 503 }
    );
  };
}

/**
 * Helper to handle OPTIONS requests for CORS
 */
export function handleOptions(methods: string[] = ['GET', 'POST', 'OPTIONS']) {
  return new NextResponse(null, {
    headers: {
      'Allow': methods.join(', ')
    }
  });
}

/**
 * Helper to create a JSON error response
 */
export function createErrorResponse(
  error: string | Record<string, any>,
  status: number = 500
): NextResponse {
  const errorResponse: ApiResponse = {
    success: false,
    error: typeof error === 'string' ? error : error,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Helper to create a JSON success response
 */
export function createSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  const successResponse: ApiResponse = {
    success: true,
    ...(data && { data }),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(successResponse, { status });
}

/**
 * Helper to validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Helper to convert string to ObjectId
 */
export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

export type { ApiHandler, ApiMiddlewareOptions, ApiResponse };