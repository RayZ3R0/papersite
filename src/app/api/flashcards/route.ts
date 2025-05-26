import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardCollection from '@/models/FlashcardCollection';
import { CreateCollectionRequest, CollectionResponse } from '@/types/flashcard';
import { requireAuth } from '@/lib/auth/validation';
import { FLASHCARD_CONFIG } from '@/lib/data/flashcard-config';
import rateLimit from '@/lib/rate-limit';
import { z } from 'zod';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Validation schemas
const createCollectionSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  subjectId: z.string()
    .min(1, 'Subject is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'Invalid subject ID'),
  unitId: z.string()
    .regex(/^[a-zA-Z0-9_]+$/, 'Invalid unit ID')
    .optional(),
});

// Get all collections for the current user
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(request, 10, 'CACHE_TOKEN');

    const payload = await requireAuth();
    await dbConnect();

    // Parse query parameters with validation
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject');
    const unitId = searchParams.get('unit');

    // Validate query parameters
    if (subjectId && !/^[a-zA-Z0-9_]+$/.test(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID format' },
        { status: 400 }
      );
    }

    if (unitId && !/^[a-zA-Z0-9_]+$/.test(unitId)) {
      return NextResponse.json(
        { error: 'Invalid unit ID format' },
        { status: 400 }
      );
    }

    // Build query with user restriction
    const query = {
      userId: payload.userId,
      ...(subjectId && { subjectId }),
      ...(unitId && { unitId }),
    };

    const collections = await FlashcardCollection.find(query)
      .sort({ updatedAt: -1 })
      .limit(100) // Prevent excessive data fetching
      .lean();

    return NextResponse.json(collections);
  } catch (error) {
    if (error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// Create a new collection
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for POST requests
    await limiter.check(request, 5, 'CACHE_TOKEN');

    const payload = await requireAuth();
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCollectionSchema.parse(body);
    
    // Validate subject exists
    const subject = FLASHCARD_CONFIG.SUBJECTS.find(s => s.id === validatedData.subjectId);
    if (!subject) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // If unit provided, validate it belongs to the subject
    if (validatedData.unitId) {
      const unit = subject.units.find(u => u.id === validatedData.unitId);
      if (!unit) {
        return NextResponse.json(
          { error: 'Invalid unit ID for this subject' },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    // Check user's collection limit
    const userCollectionCount = await FlashcardCollection.countDocuments({
      userId: payload.userId
    });

    if (userCollectionCount >= 50) { // Reasonable limit
      return NextResponse.json(
        { error: 'Maximum number of collections reached' },
        { status: 400 }
      );
    }

    const collection = await FlashcardCollection.create({
      ...validatedData,
      userId: payload.userId,
      cardCount: 0,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}