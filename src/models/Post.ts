import mongoose from 'mongoose';
import { UserWithoutPassword } from '@/lib/authTypes';

export interface IPost {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
  edited: boolean;
  editedAt?: Date;
  likes: string[];
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  lastReplyAt?: Date;
  replyCount: number;
  userInfo?: Partial<UserWithoutPassword>;
}

const postSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  likes: [{
    type: String,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastReplyAt: {
    type: Date
  },
  replyCount: {
    type: Number,
    default: 0
  }
}, {
  // Enable virtual population
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for user info
postSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username role verified' }
});

// Create indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ username: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

// Update lastReplyAt on reply count change
postSchema.pre('save', function(next) {
  if (this.isModified('replyCount')) {
    this.lastReplyAt = new Date();
  }
  next();
});

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;