import mongoose from 'mongoose';
import { UserWithoutPassword } from '@/lib/authTypes';

// Base interface with common properties
interface BasePost {
  _id?: string;
  title: string;
  content: string;
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

// Client-side interface with string author
export interface IPost extends BasePost {
  author: string;
}

// Server-side interface with ObjectId author
export interface IPostModel extends Omit<BasePost, '_id'> {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
}

// Mock methods that always return empty results
const createMockMethods = () => ({
  find: () => ({
    sort: () => ({
      limit: () => ({
        populate: () => Promise.resolve([])
      }),
      populate: () => Promise.resolve([])
    }),
    populate: () => Promise.resolve([])
  }),
  findById: () => ({
    populate: () => Promise.resolve(null)
  }),
  exists: () => Promise.resolve(false),
  findByIdAndUpdate: () => Promise.resolve(null),
  deleteOne: () => Promise.resolve({ acknowledged: true }),
  populate: () => Promise.resolve(null),
  create: () => Promise.resolve({}),
  save: () => Promise.resolve({}),
});

// Define schema
const postSchema = new mongoose.Schema<IPostModel>({
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

// Initialize model with proper checks
function getPostModel(): mongoose.Model<IPostModel> {
  // Client-side or build-time
  if (typeof window !== 'undefined' || (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI)) {
    return createMockMethods() as unknown as mongoose.Model<IPostModel>;
  }

  // Server-side with mongoose available
  if (mongoose.connection.readyState === 1) {
    try {
      return mongoose.models.Post || mongoose.model<IPostModel>('Post', postSchema);
    } catch {
      return mongoose.model<IPostModel>('Post', postSchema);
    }
  }

  // If no connection, return mock methods
  return createMockMethods() as unknown as mongoose.Model<IPostModel>;
}

// Create and export the model
export const Post = getPostModel();
export default Post;