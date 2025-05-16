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
  // Return existing model if available
  if (mongoose.models.Reply) {
    return mongoose.models.Reply;
  }

  // Only create model on server side
  if (typeof window === 'undefined') {
    try {
      return mongoose.model<IReplyModel>('Reply', replySchema);
    } catch (error) {
      if ((error as Error).name === 'OverwriteModelError') {
        return mongoose.model<IReplyModel>('Reply');
      }
      throw error;
    }
  }

  // Return a lightweight proxy for client-side type checking
  // This will be replaced by actual data from API calls
  const clientProxy = new Proxy({} as mongoose.Model<IReplyModel>, {
    get: (target, prop) => {
      if (prop === 'modelName') return 'Reply';
      if (prop === 'schema') return replySchema;
      return () => {
        console.warn('Attempting to call Reply model method on client side');
        return Promise.resolve(null);
      };
    }
  });

  return clientProxy;
}

// Create and export the model
export const Reply = getReplyModel();
export default Reply;
