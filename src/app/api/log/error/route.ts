import { NextResponse } from 'next/server';

interface ErrorLog {
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    vendor: string;
  };
  location?: string;
  timestamp: string;
  traceId: string;
  context: {
    environment: string;
    version?: string;
    [key: string]: any;
  };
  tags: {
    errorType: string;
    [key: string]: string;
  };
}

export async function POST(request: Request) {
  try {
    const errorLog: ErrorLog = await request.json();

    // Add server timestamp
    const serverTimestamp = new Date().toISOString();

    // Prepare log data
    const logData = {
      ...errorLog,
      serverTimestamp,
      // Add server environment info
      serverContext: {
        nodeEnv: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION || 'unknown',
      }
    };

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Log to Vercel
      console.error(JSON.stringify(logData));
      
      // You can also send to other logging services here
      // e.g. Sentry, LogRocket, etc.
    }

    // In development, pretty print to console
    if (process.env.NODE_ENV === 'development') {
      console.error('[Server Error Log]', {
        message: logData.message,
        name: logData.name,
        traceId: logData.traceId,
        timestamp: logData.timestamp,
        deviceInfo: logData.deviceInfo,
        tags: logData.tags
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Error Logger Failed]', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}