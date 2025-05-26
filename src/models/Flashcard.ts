import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashcardCollection',
    required: true,
    index: true,
  },
  front: {
    type: String,
    required: true,
    trim: true,
  },
  back: {
    type: String,
    required: true,
    trim: true,
  },
  hasLatex: {
    type: Boolean,
    default: false,
  },
  // Study progress fields
  lastReviewed: {
    type: Date,
    default: null,
  },
  nextReview: {
    type: Date,
    default: null,
  },
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  reviewCount: {
    type: Number,
    default: 0,
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
  timestamps: true, // Automatically manage createdAt and updatedAt
});

// Compound index for efficient collection queries with study progress
flashcardSchema.index({ collectionId: 1, nextReview: 1 });
flashcardSchema.index({ collectionId: 1, confidence: 1 });

// Pre-save middleware to check for LaTeX content
flashcardSchema.pre('save', function(next) {
  // Simple check for LaTeX delimiters
  const hasLatexDelimiters = (text: string) => {
    return text.includes('\\(') || text.includes('\\[') || 
           text.includes('$') || text.includes('\\begin{');
  };
  
  this.hasLatex = hasLatexDelimiters(this.front) || hasLatexDelimiters(this.back);
  next();
});

const Flashcard = mongoose.models.Flashcard || 
  mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;