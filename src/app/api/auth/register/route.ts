import { NextResponse } from 'next/server';
import { withDb } from '@/lib/api-middleware';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { RegistrationData } from '@/types/registration';

export const POST = withDb(async (req) => {
  try {
    const data: RegistrationData = await req.json();
    const { basicInfo, subjects, studyPreferences, currentSession } = data;

    // Validate required fields
    if (!basicInfo?.username || !basicInfo?.email || !basicInfo?.password) {
      return createErrorResponse('Username, email and password are required', 400);
    }

    // Check if username exists
    const existingUser = await User.findOne({ username: basicInfo.username });
    if (existingUser) {
      return createErrorResponse('Username already exists', 400);
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email: basicInfo.email });
    if (existingEmail) {
      return createErrorResponse('Email already registered', 400);
    }

    // Create user with basic info
    const user = await User.create({
      username: basicInfo.username,
      email: basicInfo.email,
      password: basicInfo.password, // Password will be hashed by the model pre-save hook
      role: 'user',
      verified: false,
      // Optional fields
      ...(subjects?.length ? { subjects } : {}),
      ...(studyPreferences ? { studyPreferences } : {}),
      ...(currentSession ? { currentSession } : {})
    });

    // Create safe user data without sensitive fields
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      subjects: user.subjects,
      studyPreferences: user.studyPreferences,
      currentSession: user.currentSession
    };

    return createSuccessResponse({
      message: 'Registration successful',
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Registration failed', 500);
  }
});