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
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  tags: string[];
  lastReplyAt?: Date;
  replyCount: number;
  modifiedBy?: ModAction;
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

// Moderation action metadata
interface ModAction {
  action: 'edit' | 'pin' | 'lock' | 'delete' | 'restore';
  user: string;
  timestamp: Date;
  previousState?: boolean;
  reason?: string;
}

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
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: String
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
  },
  modifiedBy: {
    action: {
      type: String,
      enum: ['edit', 'pin', 'lock', 'delete', 'restore']
    },
    user: String,
    timestamp: Date,
    previousState: Boolean,
    reason: String
  }
}, {
  timestamps: true,
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
postSchema.index({ isDeleted: 1 });

// Update lastReplyAt on reply count change
postSchema.pre('save', function(next) {
  if (this.isModified('replyCount')) {
    this.lastReplyAt = new Date();
  }
  next();
});

// Initialize model with proper checks
function getPostModel(): mongoose.Model<IPostModel> {
  // Return existing model if available
  if (mongoose.models.Post) {
    return mongoose.models.Post;
  }

  // Only create model on server side
  if (typeof window === 'undefined') {
    try {
      return mongoose.model<IPostModel>('Post', postSchema);
    } catch (error) {
      if ((error as Error).name === 'OverwriteModelError') {
        return mongoose.model<IPostModel>('Post');
      }
      throw error;
    }
  }

  // Return a lightweight proxy for client-side type checking
  // This will be replaced by actual data from API calls
  const clientProxy = new Proxy({} as mongoose.Model<IPostModel>, {
    get: (target, prop) => {
      if (prop === 'modelName') return 'Post';
      if (prop === 'schema') return postSchema;
      return () => {
        console.warn('Attempting to call Post model method on client side');
        return Promise.resolve(null);
      };
    }
  });

  return clientProxy;
}

// Create and export the model
export const Post = getPostModel();
export default Post;
