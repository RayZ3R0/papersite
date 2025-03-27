import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 10000 
  },
  authorName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50 
  },
  authorId: { 
    type: String, 
    required: true,
    index: true 
  },
  ip: {
    type: String,
    required: true,
    select: false // Don't return IP in normal queries
  },
  tags: [{ 
    type: String,
    trim: true,
    maxlength: 30 
  }],
  replyCount: { 
    type: Number, 
    default: 0 
  },
  editedAt: {
    type: Date,
    default: null
  },
  editCount: {
    type: Number,
    default: 0
  },
  lastEditWindow: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add text index for search
PostSchema.index({ title: 'text', content: 'text' });

// Update the timestamps before saving
PostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export type PostDocument = mongoose.Document & {
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  ip: string;
  tags: string[];
  replyCount: number;
  editedAt: Date | null;
  editCount: number;
  lastEditWindow: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const Post = mongoose.models.Post || mongoose.model<PostDocument>('Post', PostSchema);