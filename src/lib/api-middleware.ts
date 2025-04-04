import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './mongodb';
import { withLogging } from './api-logger';

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

interface ApiMiddlewareOptions {
  requireConnection?: boolean;
}

/**
 * Higher-order function to wrap API route handlers with database connection
 * and error handling
 */
export function withDb(handler: ApiHandler, options: ApiMiddlewareOptions = {}) {
  // Wrap the handler with logging
  const handlerWithLogging = withLogging(handler);
  return async function (req: NextRequest) {
    try {

      // Connect to database
      await dbConnect();
      
      // Execute the handler with logging
      const response = await handlerWithLogging(req);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      
      // If MongoDB connection error, return 503
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError')
      ) {
        console.error('MongoDB connection error:', error);
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