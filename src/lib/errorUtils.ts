interface ErrorReport {
  error: Error;
  componentStack?: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    vendor: string;
  };
  location?: string;
  timestamp?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

// Log levels for different types of errors
export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error categories for better organization
export enum ErrorCategory {
  NETWORK = 'network',
  UI = 'ui',
  AUTH = 'auth',
  API = 'api',
  UNKNOWN = 'unknown'
}

/**
 * Captures and reports errors to the server
 */
export async function captureError(report: ErrorReport): Promise<void> {
  try {
    // Add trace ID for request tracing
    const traceId = generateTraceId();
    
    // Prepare error data for logging
    const errorLog = {
      message: report.error.message,
      name: report.error.name,
      stack: report.error.stack,
      componentStack: report.componentStack,
      deviceInfo: report.deviceInfo,
      location: report.location,
      timestamp: report.timestamp || new Date().toISOString(),
      traceId,
      // Include additional context
      context: {
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION,
        ...report.metadata
      },
      tags: {
        errorType: categorizeError(report.error),
        ...report.tags
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Captured]', errorLog);
      return;
    }

    // In production, send to error logging service
    await sendErrorToServer(errorLog);

  } catch (err) {
    // Fallback logging if error reporting fails
    console.error('[Error Reporter Failed]', err);
  }
}

/**
 * Generates a unique trace ID for request tracing
 */
function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Categorizes errors for better filtering and analysis
 */
function categorizeError(error: Error): ErrorCategory {
  if (error.name === 'NetworkError' || error.message.toLowerCase().includes('network')) {
    return ErrorCategory.NETWORK;
  }
  if (error.name === 'AuthError' || error.message.toLowerCase().includes('auth')) {
    return ErrorCategory.AUTH;
  }
  if (error.message.toLowerCase().includes('api')) {
    return ErrorCategory.API;
  }
  if (error instanceof Error && 'componentStack' in error) {
    return ErrorCategory.UI;
  }
  return ErrorCategory.UNKNOWN;
}

/**
 * Sends error data to logging service
 * This can be configured to use any error logging service (e.g. Sentry, Vercel)
 */
async function sendErrorToServer(errorLog: any): Promise<void> {
  try {
    const response = await fetch('/api/log/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog),
    });

    if (!response.ok) {
      throw new Error('Failed to send error log');
    }
  } catch (err) {
    // Fallback to console in case of network failure
    console.error('[Error Logging Failed]', err);
  }
}

/**
 * Performance monitoring functions
 */
export const performance = {
  // Track post loading performance
  trackPostLoad: (duration: number, success: boolean) => {
    if (process.env.NODE_ENV === 'production') {
      // Send performance metric to analytics
      const metric = {
        name: 'post_load',
        value: duration,
        success,
        timestamp: Date.now(),
      };
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(console.error);
    }
  },

  // Track client-side errors
  trackClientError: (error: Error, context?: Record<string, any>) => {
    captureError({
      error,
      metadata: { 
        context,
        isMobile: /Mobile/.test(navigator.userAgent),
      },
      tags: { type: 'client_error' }
    });
  }
};