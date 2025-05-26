import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import FlashcardCollection from '@/models/FlashcardCollection';
import Flashcard from '@/models/Flashcard';
import { UpdateCollectionRequest } from '@/types/flashcard';
import { requireAuth } from '@/lib/auth/validation';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validate ObjectId
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

// Get a specific collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
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
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// Update a collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
        { status: 400 }
      );
    }

    const payload = await requireAuth();
    const body: UpdateCollectionRequest = await request.json();
    
    await dbConnect();

    const collection = await FlashcardCollection.findOneAndUpdate(
      {
        _id: new Types.ObjectId(params.id),
        userId: payload.userId,
      },
      body,
      { new: true, lean: true }
    );

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// Delete a collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
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

    // Delete all cards in the collection first
    await Flashcard.deleteMany({
      collectionId: new Types.ObjectId(params.id),
    });

    // Delete the collection
    await FlashcardCollection.findByIdAndDelete(
      new Types.ObjectId(params.id)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}