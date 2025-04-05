import { NextResponse } from 'next/server';
import { withDb } from '@/lib/api-middleware';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export const POST = withDb(async (req) => {
  try {
    const { username, email, password } = await req.json();

    // Validate input
    if (!username || !email || !password) {
      return createErrorResponse('All fields are required', 400);
    }

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return createErrorResponse('Username already exists', 400);
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return createErrorResponse('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password, // Password will be hashed by the model pre-save hook
      role: 'user',
      verified: false,
    });

    // Remove sensitive data
    const userData = user.toJSON();

    return createSuccessResponse({
      message: 'Registration successful',
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Registration failed', 500);
  }
});