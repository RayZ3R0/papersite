import mongoose from 'mongoose';
import { User } from './User';
import { UserRole } from '@/lib/auth/jwt';

export interface IPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
  edited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastReplyAt?: Date;
  userInfo?: {
    username: string;
    role: UserRole;
    verified: boolean;
  };
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
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
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    replyCount: {
      type: Number,
      default: 0
    },
    lastReplyAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for user info
postSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username role verified' }
});

// Virtual field for replies (not populated by default)
postSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'postId',
  options: { sort: { createdAt: 1 } }
});

// Make sure virtuals are included when converting to JSON
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    // Convert _id to string
    if (ret._id) {
      ret._id = ret._id.toString();
    }
    // Convert dates to ISO strings
    if (ret.createdAt) {
      ret.createdAt = ret.createdAt.toISOString();
    }
    if (ret.editedAt) {
      ret.editedAt = ret.editedAt.toISOString();
    }
    if (ret.lastReplyAt) {
      ret.lastReplyAt = ret.lastReplyAt.toISOString();
    }
    return ret;
  }
});

// Clean content before save
postSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    // Basic XSS prevention
    this.content = this.content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    this.title = this.title
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Set edited flag and timestamp
    if (!this.isNew) {
      this.edited = true;
      this.editedAt = new Date();
    }
  }
  next();
});

// Update lastReplyAt when reply count changes
postSchema.pre('save', function(next) {
  if (this.isModified('replyCount') && this.replyCount > 0) {
    this.lastReplyAt = new Date();
  }
  next();
});

// Create indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ lastReplyAt: -1 });
postSchema.index({ isPinned: -1, lastReplyAt: -1 }); // For sorted queries

export const Post = mongoose.models.Post || 
  mongoose.model<IPost>('Post', postSchema);