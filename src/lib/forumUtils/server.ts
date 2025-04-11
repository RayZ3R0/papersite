import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';

export async function getFormattedPost(postId: string) {
  const post = await Post.findById(postId);
  if (!post) return null;

  const populatedPost = await Post.populate(post, {
    path: 'userInfo',
    select: 'username role verified'
  });

  const replies = await Reply.find({ postId })
    .sort('createdAt')
    .populate('userInfo', 'username role verified')
    .lean();

  // Ensure userInfo has the correct shape
  const formattedUserInfo = populatedPost.userInfo ? {
    role: populatedPost.userInfo.role || 'user',
    verified: populatedPost.userInfo.verified || false
  } : undefined;

  return {
    post: {
      ...populatedPost.toObject(),
      _id: populatedPost._id.toString(),
      author: populatedPost.author.toString(),
      createdAt: populatedPost.createdAt?.toISOString(),
      editedAt: populatedPost.editedAt?.toISOString(),
      userInfo: formattedUserInfo
    },
    replies: replies.map(reply => ({
      ...reply,
      _id: reply._id.toString(),
      author: reply.author.toString(),
      createdAt: reply.createdAt?.toISOString(),
      editedAt: reply.editedAt?.toISOString(),
      userInfo: reply.userInfo ? {
        role: reply.userInfo.role || 'user',
        verified: reply.userInfo.verified || false
      } : undefined
    }))
  };
}