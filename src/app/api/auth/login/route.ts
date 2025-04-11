import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { AuthError } from '@/lib/authTypes';
import mongoose from 'mongoose';

// Use Node.js runtime for mongoose
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

// Set maximum duration for login operations
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const body = await request.json();
    const { email, username, password, rememberMe } = body;

    const result = await loginUser({
      email,
      username,
      password,
      options: {
        sessionDuration: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
        rememberMe
      }
    });

    if (!result || !result.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'SERVER_ERROR' ? 500 : 401 }
      );
    }

    if (error instanceof mongoose.Error.MongooseError) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  } finally {
    // Ensure we don't keep idle connections
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.close();
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
}

// Handle preflight requests
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}