import mongoose from 'mongoose';
import { PostDocument } from './Post';

const ReplySchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post',
    required: true,
    index: true 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 5000 
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
  }
});

// Update post's reply count when a reply is added
ReplySchema.post('save', async function(doc) {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(doc.postId, { $inc: { replyCount: 1 } });
});

// Decrease post's reply count when a reply is deleted
ReplySchema.pre('deleteOne', { document: true, query: false }, async function() {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.postId, { $inc: { replyCount: -1 } });
});

export interface ReplyDocument extends mongoose.Document {
  postId: PostDocument['_id'];
  content: string;
  authorName: string;
  authorId: string;
  ip: string;
  editedAt: Date | null;
  editCount: number;
  lastEditWindow: Date | null;
  createdAt: Date;
}

export const Reply = mongoose.models.Reply || mongoose.model<ReplyDocument>('Reply', ReplySchema);