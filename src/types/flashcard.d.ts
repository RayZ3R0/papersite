import { Types } from 'mongoose';

export interface FlashcardCollection {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  subjectId: string;
  unitId?: string;
  description: string;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  _id: Types.ObjectId;
  collectionId: Types.ObjectId;
  front: string;
  back: string;
  hasLatex: boolean;
  lastReviewed: Date | null;
  nextReview: Date | null;
  confidence: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Request Types
export interface CreateCollectionRequest {
  name: string;
  subjectId: string;
  unitId?: string;
  description?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
}

export interface StudyProgressUpdate {
  confidence: number;
  lastReviewed: Date;
  nextReview: Date;
}

// API Response Types
export interface CollectionResponse extends FlashcardCollection {
  cards?: Flashcard[];
}

export interface StudySessionStats {
  totalCards: number;
  reviewedCards: number;
  averageConfidence: number;
  masteredCards: number; // cards with confidence 5
  needsPractice: number; // cards with confidence 1-2
}