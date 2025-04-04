import { NextRequest } from 'next/server';
import { withDb, createSuccessResponse, createErrorResponse } from '@/lib/api-middleware';
import mongoose from 'mongoose';

export const GET = withDb(async (request: NextRequest) => {
  try {
    // Check MongoDB connection
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return createErrorResponse('Database connection error', 503);
    }

    return createSuccessResponse({
      status: 'healthy',
      database: {
        connected: true,
        host: mongoose.connection.host
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return createErrorResponse('Service health check failed', 500);
  }
});