import PostPageClient from './PostPageClient';
import { getFormattedPost } from '@/lib/forumUtils/server';

// Enable NodeJS runtime for MongoDB
export const runtime = 'nodejs';
// Disable page caching to ensure fresh data
export const dynamic = 'force-dynamic';

type UserInfo = {
  role: string;
  verified: boolean;
};

type Post = {
  _id: string;
  title: string;
  content: string;
  author: string;
  username: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  replyCount: number;
  userInfo?: UserInfo;
};

type Reply = {
  _id: string;
  content: string;
  author: string;
  username: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  userInfo?: UserInfo;
};

export default async function PostPage({ params }: { params: { postId: string } }) {
  const data = await getFormattedPost(params.postId) as { 
    post: Post;
    replies: Reply[];
  } | null;
  
  return <PostPageClient initialData={data} />;
}
