import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { MongoClient } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { COOKIE_CONFIG } from '@/lib/auth/config';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { AuthError } from '@/lib/authTypes';

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const {
      basicInfo,
      subjects,
      currentSession,
      studyPreferences
    } = await request.json();

    // Validate required fields
    if (!basicInfo?.username || !basicInfo?.email || !basicInfo?.password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { username, email, password } = basicInfo;

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if username or email already exists
    const existingUser = await db.collection('users').findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      const field = existingUser.username === username.toLowerCase() 
        ? 'username' 
        : 'email';
      return NextResponse.json(
        { error: `This ${field} is already registered` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      verified: false,
      banned: false,
      subjects: subjects || [],
      currentSession: currentSession || null,
      studyPreferences: studyPreferences || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(user);

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const response = NextResponse.json({
      user: {
        ...payload,
        email: user.email,
        verified: user.verified
      }
    });

    // Set cookies
    response.cookies.set(
      COOKIE_CONFIG.accessToken.name,
      accessToken,
      COOKIE_CONFIG.accessToken.options
    );

    response.cookies.set(
      COOKIE_CONFIG.refreshToken.name,
      refreshToken,
      COOKIE_CONFIG.refreshToken.options
    );

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

// Force this route to be processed as a Node.js API route
export const preferredRegion = 'home';