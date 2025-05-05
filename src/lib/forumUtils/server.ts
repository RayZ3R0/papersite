import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import mongoose from 'mongoose';
import { IPost, IPostModel } from '@/models/Post';
import { IReply, IReplyModel } from '@/models/Reply';

// Helper function to safely convert ObjectId to string with validation
function safeObjectIdToString(id: mongoose.Types.ObjectId | string | undefined): string | null {
  if (!id) return null;
  try {
    return typeof id === 'string' ? id : id.toString();
  } catch (error) {
    console.error('Error converting ObjectId to string:', error);
    return null;
  }
}

// Helper function to validate and convert string to ObjectId
function validateObjectId(id: string): mongoose.Types.ObjectId | null {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  } catch (error) {
    console.error('Invalid ObjectId:', error);
    return null;
  }
}

// Helper function to serialize dates
function serializeDate(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

// Helper function to format user info
function formatUserInfo(userInfo: any) {
  if (!userInfo) return undefined;
  return {
    role: userInfo.role || 'user',
    verified: userInfo.verified || false,
    username: userInfo.username
  };
}

// Helper function to serialize likes array
function serializeLikes(likes: Array<string | mongoose.Types.ObjectId>): string[] {
  return likes.map(like => typeof like === 'string' ? like : like.toString());
}

export async function getFormattedPost(postId: string) {
  // Validate postId first
  const validPostId = validateObjectId(postId);
  if (!validPostId) {
    throw new Error('Invalid post ID format');
  }

  const post = await Post.findById(validPostId);
  if (!post) return null;

  const populatedPost = await Post.populate(post, {
    path: 'userInfo',
    select: 'username role verified'
  });

  const replies = await Reply.find({ postId: validPostId })
    .sort('createdAt')
    .populate('userInfo', 'username role verified')
    .lean();

  const formattedPost = {
    post: {
      ...populatedPost.toObject(),
      _id: safeObjectIdToString(populatedPost._id),
      author: safeObjectIdToString(populatedPost.author),
      createdAt: serializeDate(populatedPost.createdAt),
      editedAt: serializeDate(populatedPost.editedAt),
      userInfo: formatUserInfo(populatedPost.userInfo),
      likes: serializeLikes(populatedPost.likes)
    },
    replies: replies.map(reply => ({
      ...reply,
      _id: safeObjectIdToString(reply._id),
      postId: safeObjectIdToString(reply.postId),
      author: safeObjectIdToString(reply.author),
      createdAt: serializeDate(reply.createdAt),
      editedAt: serializeDate(reply.editedAt),
      userInfo: formatUserInfo(reply.userInfo),
      likes: serializeLikes(reply.likes || [])
    }))
  };

  return formattedPost;
}