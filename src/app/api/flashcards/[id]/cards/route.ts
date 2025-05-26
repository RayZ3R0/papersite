import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import FlashcardCollection from '@/models/FlashcardCollection';
import Flashcard from '@/models/Flashcard';
import { UpdateFlashcardRequest, CreateFlashcardRequest } from '@/types/flashcard';
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

const updateFlashcardSchema = z.object({
  front: z.string()
    .max(2000, 'Front content must be less than 2000 characters')
    .optional(),
  back: z.string()
    .max(2000, 'Back content must be less than 2000 characters')
    .optional(),
  confidence: z.number()
    .min(1)
    .max(5)
    .optional(),
});

// Validate ObjectId
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

// Sanitize LaTeX content
function sanitizeLatexContent(content: string): string {
  // Allow basic LaTeX math but sanitize HTML
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  // Basic LaTeX validation - only allow common math expressions
  const latexPattern = /\$([^$\n<>]{1,200})\$/g;
  const validLatex = sanitized.replace(latexPattern, (match, tex) => {
    // Basic validation for LaTeX content
    if (tex.includes('<script>') || tex.includes('javascript:')) {
      return tex; // Remove LaTeX wrapper if suspicious content
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

    // Verify collection exists and belongs to user
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
    .limit(200) // Prevent excessive data fetching
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
    await limiter.check(request, 3, 'CACHE_TOKEN'); // Stricter rate limiting for creation

    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID format' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createFlashcardSchema.parse(body);
    
    // Sanitize content
    validatedData.front = sanitizeLatexContent(validatedData.front);
    validatedData.back = sanitizeLatexContent(validatedData.back);

    await dbConnect();

    // Verify collection exists and belongs to user
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

    // Check if collection has reached card limit
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

    // Update collection card count
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

// Update a card
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; cardId: string } }
) {
  try {
    await limiter.check(request, 5, 'CACHE_TOKEN');

    // Validate IDs format
    if (!isValidObjectId(params.id) || !isValidObjectId(params.cardId)) {
      return NextResponse.json(
        { error: 'Invalid collection or card ID format' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateFlashcardSchema.parse(body);

    // Sanitize content if provided
    if (validatedData.front) {
      validatedData.front = sanitizeLatexContent(validatedData.front);
    }
    if (validatedData.back) {
      validatedData.back = sanitizeLatexContent(validatedData.back);
    }

    await dbConnect();

    // Verify collection exists and belongs to user
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

    // Find and update the card
    const updatedCard = await Flashcard.findOneAndUpdate(
      {
        _id: new Types.ObjectId(params.cardId),
        collectionId: new Types.ObjectId(params.id),
      },
      { 
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCard);
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

    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; cardId: string } }
) {
  try {
    await limiter.check(request, 3, 'CACHE_TOKEN');

    // Validate IDs format
    if (!isValidObjectId(params.id) || !isValidObjectId(params.cardId)) {
      return NextResponse.json(
        { error: 'Invalid collection or card ID format' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    await dbConnect();

    // Verify collection exists and belongs to user
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

    // Find and delete the card
    const card = await Flashcard.findOneAndDelete({
      _id: new Types.ObjectId(params.cardId),
      collectionId: new Types.ObjectId(params.id),
    }).lean();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    // Update collection card count
    await FlashcardCollection.findByIdAndUpdate(
      new Types.ObjectId(params.id),
      { $inc: { cardCount: -1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}

// Update study progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; cardId: string } }
) {
  try {
    await limiter.check(request, 5, 'CACHE_TOKEN');

    // Validate IDs format
    if (!isValidObjectId(params.id) || !isValidObjectId(params.cardId)) {
      return NextResponse.json(
        { error: 'Invalid collection or card ID format' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    await dbConnect();

    // Verify collection exists and belongs to user
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

    const body = await request.json();
    const { confidence } = body;

    if (typeof confidence !== 'number' || confidence < 1 || confidence > 5) {
      return NextResponse.json(
        { error: 'Invalid confidence rating. Must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Calculate next review date based on confidence
    const now = new Date();
    let nextReview: Date;

    switch (confidence) {
      case 1:
        nextReview = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
        break;
      case 2:
        nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        break;
      case 3:
        nextReview = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 4:
        nextReview = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case 5:
        nextReview = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextReview = now;
    }

    // Update card study progress
    const updatedCard = await Flashcard.findOneAndUpdate(
      {
        _id: new Types.ObjectId(params.cardId),
        collectionId: new Types.ObjectId(params.id),
      },
      {
        confidence,
        lastReviewed: now,
        nextReview,
        $inc: { reviewCount: 1 },
      },
      { new: true, lean: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    if (error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    console.error('Error updating study progress:', error);
    return NextResponse.json(
      { error: 'Failed to update study progress' },
      { status: 500 }
    );
  }
}