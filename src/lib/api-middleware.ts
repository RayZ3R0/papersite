import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './mongodb';

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

interface ApiMiddlewareOptions {
  requireConnection?: boolean;
}

/**
 * Higher-order function to wrap API route handlers with database connection
 * and error handling
 */
export function withDb(handler: ApiHandler, options: ApiMiddlewareOptions = {}) {
  return async function (req: NextRequest) {
    try {
      // Skip DB connection during build
      if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
        if (options.requireConnection) {
          return NextResponse.json(
            { error: 'Service unavailable during build' },
            { status: 503 }
          );
        }
        return handler(req);
      }

      // Connect to database
      await dbConnect();
      
      // Execute the handler
      const response = await handler(req);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      
      // If MongoDB connection error during build, return 503
      if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }

      // Handle known errors
      if (error instanceof Error) {
        const status = error.name === 'ValidationError' ? 400 : 500;
        return NextResponse.json(
          { error: error.message },
          { status }
        );
      }

      // Handle unknown errors
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
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
export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Helper to create a JSON success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}