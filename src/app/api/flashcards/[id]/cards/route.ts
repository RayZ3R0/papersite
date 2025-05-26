import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import FlashcardCollection from '@/models/FlashcardCollection';
import Flashcard from '@/models/Flashcard';
import { CreateFlashcardRequest } from '@/types/flashcard';
import { requireAuth } from '@/lib/auth/validation';
import { FLASHCARD_CONFIG } from '@/lib/data/flashcard-config';
import rateLimit from '@/lib/rate-limit';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Rate limiting
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Validation schemas
const createFlashcardSchema = z.object({
  front: z.string()
    .min(1, 'Front content is required')
    .max(2000, 'Front content must be less than 2000 characters'),
  back: z.string()
    .min(1, 'Back content is required')
    .max(2000, 'Back content must be less than 2000 characters'),
});

// Validate ObjectId
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

// Sanitize LaTeX content
function sanitizeLatexContent(content: string): string {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  const latexPattern = /\$([^$\n<>]{1,200})\$/g;
  const validLatex = sanitized.replace(latexPattern, (match, tex) => {
    if (tex.includes('<script>') || tex.includes('javascript:')) {
      return tex;
    }
    return match;
  });
  
  return validLatex;
}

// Get all cards for a collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await limiter.check(request, 10, 'CACHE_TOKEN');

    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID format' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    await dbConnect();

    const collection = await FlashcardCollection.findOne({
      _id: new Types.ObjectId(params.id),
      userId: payload.userId,
    }).lean();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const cards = await Flashcard.find({
      collectionId: new Types.ObjectId(params.id)
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

    return NextResponse.json(cards);
  } catch (error) {
    if (error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

// Create a new card
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await limiter.check(request, 3, 'CACHE_TOKEN');

    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID format' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    
    const body = await request.json();
    const validatedData = createFlashcardSchema.parse(body);
    
    validatedData.front = sanitizeLatexContent(validatedData.front);
    validatedData.back = sanitizeLatexContent(validatedData.back);

    await dbConnect();

    const collection = await FlashcardCollection.findOne({
      _id: new Types.ObjectId(params.id),
      userId: payload.userId,
    }).lean();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    if (collection.cardCount >= FLASHCARD_CONFIG.CARDS_PER_UNIT) {
      return NextResponse.json(
        { error: `Maximum ${FLASHCARD_CONFIG.CARDS_PER_UNIT} cards per collection` },
        { status: 400 }
      );
    }

    const card = await Flashcard.create({
      ...validatedData,
      collectionId: new Types.ObjectId(params.id),
      confidence: 1,
      reviewCount: 0,
      lastReviewed: null,
      nextReview: new Date(),
    });

    await FlashcardCollection.findByIdAndUpdate(
      new Types.ObjectId(params.id),
      { $inc: { cardCount: 1 } }
    );

    return NextResponse.json(card, { status: 201 });
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

    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}