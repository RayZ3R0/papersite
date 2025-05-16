import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration: number;
  error?: string;
}

export function logRequest(entry: LogEntry) {
  // Format the log entry
  const log = `[${entry.timestamp}] ${entry.method} ${entry.url} ${entry.status || ''} ${entry.duration}ms${entry.error ? ' Error: ' + entry.error : ''}`;
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Sentry, LogDNA)
    console.log(log);
  } else {
    console.log(log);
  }
}

export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function (request: NextRequest) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;

    try {
      // Execute the handler
      const response = await handler(request);
      
      // Log the successful request
      logRequest({
        timestamp,
        method,
        url,
        status: response.status,
        duration: Date.now() - startTime
      });

      return response;
    } catch (error) {
      // Log the error
      logRequest({
        timestamp,
        method,
        url,
        status: 500,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  };
}