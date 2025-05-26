import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import FlashcardCollection from '@/models/FlashcardCollection';
import Flashcard from '@/models/Flashcard';
import { UpdateFlashcardRequest } from '@/types/flashcard';
import { requireAuth } from '@/lib/auth/validation';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validate ObjectId
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

// Update a card
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; cardId: string } }
) {
  try {
    // Validate IDs format
    if (!isValidObjectId(params.id) || !isValidObjectId(params.cardId)) {
      return NextResponse.json(
        { error: 'Invalid collection or card ID' },
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
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Find the card
    const card = await Flashcard.findOne({
      _id: new Types.ObjectId(params.cardId),
      collectionId: new Types.ObjectId(params.id),
    }).lean();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const body: UpdateFlashcardRequest = await request.json();
    
    // Validate body
    if (!body.front && !body.back) {
      return NextResponse.json(
        { error: 'At least one field (front or back) must be provided' },
        { status: 400 }
      );
    }

    // Update card
    const updatedCard = await Flashcard.findByIdAndUpdate(
      new Types.ObjectId(params.cardId),
      { 
        ...body,
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Failed to update card' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
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
    // Validate IDs format
    if (!isValidObjectId(params.id) || !isValidObjectId(params.cardId)) {
      return NextResponse.json(
        { error: 'Invalid collection or card ID' },
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
        { error: 'Collection not found' },
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
        { error: 'Card not found' },
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
    // Validate IDs format
    if (!isValidObjectId(params.id) || !isValidObjectId(params.cardId)) {
      return NextResponse.json(
        { error: 'Invalid collection or card ID' },
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
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Find the card
    const card = await Flashcard.findOne({
      _id: new Types.ObjectId(params.cardId),
      collectionId: new Types.ObjectId(params.id),
    }).lean();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
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
      case 1: // Need more practice
        nextReview = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
        break;
      case 2: // Somewhat familiar
        nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        break;
      case 3: // Know it
        nextReview = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
        break;
      case 4: // Know it well
        nextReview = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
        break;
      case 5: // Mastered
        nextReview = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
        break;
      default:
        nextReview = now;
    }

    // Update card study progress
    const updatedCard = await Flashcard.findByIdAndUpdate(
      new Types.ObjectId(params.cardId),
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
        { error: 'Failed to update study progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating study progress:', error);
    return NextResponse.json(
      { error: 'Failed to update study progress' },
      { status: 500 }
    );
  }
}