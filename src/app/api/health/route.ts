import { NextRequest } from 'next/server';
import { withDb, createSuccessResponse, createErrorResponse } from '@/lib/api-middleware';
import mongoose from 'mongoose';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Dynamic route for real-time health checks
export const dynamic = 'force-dynamic';

export const GET = withDb(async (request: NextRequest) => {
  try {
    // Ensure DB connection exists
    if (!mongoose.connection) {
      return createErrorResponse('Database not initialized', 503);
    }

    // Check MongoDB connection state
    const readyState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };

    const status = readyState === 1 ? 'healthy' : 'unhealthy';
    const dbStatus = stateMap[readyState as keyof typeof stateMap] || 'unknown';

    if (readyState !== 1) {
      return createErrorResponse({
        status: 'unhealthy',
        database: {
          connected: false,
          state: dbStatus,
          error: 'Database connection not ready'
        }
      }, 503);
    }

    return createSuccessResponse({
      status,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        state: dbStatus,
        host: mongoose.connection.host || 'unknown'
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return createErrorResponse({
      status: 'error',
      error: error instanceof Error ? error.message : 'Service health check failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Handle preflight requests
export const OPTIONS = () => createSuccessResponse(null, { status: 204 });