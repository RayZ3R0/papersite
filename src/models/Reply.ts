import mongoose, { Model } from 'mongoose';
import { UserWithoutPassword } from '@/lib/authTypes';

export interface IReply {
  postId: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
  edited: boolean;
  editedAt?: Date;
  likes: string[];
  userInfo?: Partial<UserWithoutPassword>;
}

// Methods interface
interface IReplyMethods {
  updatePostCount(increment?: boolean): Promise<void>;
}

// Model interface
interface ReplyModel extends Model<IReply, {}, IReplyMethods> {
  findAndPopulate(id: string): Promise<IReply | null>;
}

const replySchema = new mongoose.Schema<IReply, ReplyModel, IReplyMethods>({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 20000
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
  }]
}, {
  // Enable virtual population
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

// Method to update post count
replySchema.methods.updatePostCount = async function(increment: boolean = true): Promise<void> {
  const Post = mongoose.models.Post;
  if (Post) {
    await Post.updateOne(
      { _id: this.postId },
      { 
        $inc: { replyCount: increment ? 1 : -1 },
        ...(increment ? { $set: { lastReplyAt: new Date() } } : {})
      }
    );
  }
};

// Update post's reply count and lastReplyAt
replySchema.post('save', async function(doc) {
  await doc.updatePostCount(true);
});

// Handle reply deletion
replySchema.pre('deleteOne', { document: true }, async function() {
  await this.updatePostCount(false);
});

// Handle findOneAndDelete
replySchema.pre('findOneAndDelete', async function() {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await doc.updatePostCount(false);
  }
});

// Static method to find and populate user info
replySchema.static('findAndPopulate', async function(id: string) {
  return this.findById(id).populate('userInfo');
});

export const Reply = (mongoose.models.Reply || mongoose.model<IReply, ReplyModel>('Reply', replySchema)) as ReplyModel;

export default Reply;