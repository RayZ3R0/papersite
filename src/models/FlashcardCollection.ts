import mongoose from 'mongoose';

const flashcardCollectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  subjectId: {
    type: String,
    required: true,
    index: true,
  },
  unitId: {
    type: String,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  cardCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
flashcardCollectionSchema.index({ userId: 1, subjectId: 1 });
flashcardCollectionSchema.index({ userId: 1, unitId: 1 });
flashcardCollectionSchema.index({ userId: 1, updatedAt: -1 });

const FlashcardCollection = mongoose.models.FlashcardCollection || 
  mongoose.model('FlashcardCollection', flashcardCollectionSchema);

export default FlashcardCollection;