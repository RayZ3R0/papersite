import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './mongodb';
import { AuthError } from './authTypes';

export type ApiContext = {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
};

export type ApiHandler = (
  req: NextRequest,
  ctx: ApiContext
) => Promise<NextResponse>;

interface WithDbOptions {
  requireConnection?: boolean;
}

export function createErrorResponse(error: string | Error | AuthError, status = 500) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.type === 'UNAUTHORIZED' ? 401 : error.type === 'FORBIDDEN' ? 403 : 500 }
    );
  }

  const message = error instanceof Error ? error.message : error;
  return NextResponse.json({ error: message }, { status });
}

export function withDb(handler: ApiHandler, options: WithDbOptions = {}) {
  return async function (req: NextRequest, ctx: ApiContext) {
    try {
      // Connect to MongoDB if required
      if (options.requireConnection || process.env.NODE_ENV !== 'production') {
        await dbConnect();
      }

      // Call the handler
      return await handler(req, ctx);
    } catch (error) {
      console.error('API error:', error);
      return createErrorResponse(error instanceof Error ? error : 'Internal server error');
    }
  };
}

// Typesafe handler for preflight requests
export function handleOptions(allowedMethods: string[]) {
  return async function(): Promise<NextResponse> {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Allow': allowedMethods.join(', '),
        'Access-Control-Allow-Methods': allowedMethods.join(', '),
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  };
}