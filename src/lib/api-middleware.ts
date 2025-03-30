import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './mongodb';

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Higher-order function to wrap API route handlers with database connection
 * and error handling
 */
export function withDb(handler: ApiHandler): ApiHandler {
  return async function (req: NextRequest) {
    try {
      // Connect to database
      await dbConnect();
      
      // Execute the handler
      const response = await handler(req);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle known errors
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
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