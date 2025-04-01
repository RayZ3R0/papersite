import mongoose from 'mongoose';
import { User } from './User';
import { UserRole } from '@/lib/auth/jwt';

export interface IReply {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
  edited: boolean;
  editedAt?: Date;
  userInfo?: {
    username: string;
    role: UserRole;
    verified: boolean;
  };
}

const replySchema = new mongoose.Schema<IReply>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 10000
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for user info
replySchema.virtual('userInfo', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username role verified' }
});

// Make sure virtuals are included when converting to JSON
replySchema.set('toJSON', {
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
    return ret;
  }
});

// Clean content before save
replySchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Basic XSS prevention
    this.content = this.content
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

// Create indexes
replySchema.index({ postId: 1, createdAt: -1 });
replySchema.index({ author: 1, createdAt: -1 });

export const Reply = mongoose.models.Reply || 
  mongoose.model<IReply>('Reply', replySchema);