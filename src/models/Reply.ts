import mongoose from 'mongoose';
import { UserWithoutPassword } from '@/lib/authTypes';

// Base interface with common properties
interface BaseReply {
  content: string;
  username: string;
  createdAt: Date;
  edited: boolean;
  editedAt?: Date;
  likes: string[];
  userInfo?: Partial<UserWithoutPassword>;
}

// Client-side interface
export interface IReply extends BaseReply {
  _id?: string;
  author: string;
  postId: string;
}

// Server-side interface
export interface IReplyModel extends BaseReply {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
}

// Mock methods that always return empty results
const createMockMethods = () => ({
  find: () => ({
    sort: () => ({
      populate: () => Promise.resolve([])
    }),
    populate: () => Promise.resolve([])
  }),
  findById: () => ({
    populate: () => Promise.resolve(null)
  }),
  exists: () => Promise.resolve(false),
  deleteMany: () => Promise.resolve({ acknowledged: true }),
  deleteOne: () => Promise.resolve({ acknowledged: true }),
  populate: () => Promise.resolve(null),
  create: () => Promise.resolve({}),
  save: () => Promise.resolve({}),
});

// Define schema
const replySchema = new mongoose.Schema<IReplyModel>({
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
    required: true
  },
  username: {
    type: String,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
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
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for user info
replySchema.virtual('userInfo', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
  options: { select: 'username role verified' }
});

// Create indexes
replySchema.index({ postId: 1, createdAt: 1 });
replySchema.index({ author: 1 });
replySchema.index({ username: 1 });

// Initialize model with proper checks
function getReplyModel(): mongoose.Model<IReplyModel> {
  // Client-side or build-time
  if (typeof window !== 'undefined' || (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI)) {
    return createMockMethods() as unknown as mongoose.Model<IReplyModel>;
  }

  // Server-side with mongoose available
  if (mongoose.connection.readyState === 1) {
    try {
      return mongoose.models.Reply || mongoose.model<IReplyModel>('Reply', replySchema);
    } catch {
      return mongoose.model<IReplyModel>('Reply', replySchema);
    }
  }

  // If no connection, return mock methods
  return createMockMethods() as unknown as mongoose.Model<IReplyModel>;
}

// Create and export the model
export const Reply = getReplyModel();
export default Reply;