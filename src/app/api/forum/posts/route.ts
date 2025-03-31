import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/models/Post';
import { withDb, handleOptions } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';

// Make route dynamic
export const dynamic = 'force-dynamic';

function createMockPost() {
  return {
    _id: 'mock-id',
    title: 'Mock Post',
    content: 'Mock Content',
    author: 'mock-author',
    username: 'mock-user',
    createdAt: new Date(),
    edited: false,
    likes: [],
    views: 0,
    isPinned: false,
    isLocked: false,
    tags: [],
    replyCount: 0,
    userInfo: {
      username: 'mock-user',
      role: 'user',
      verified: false
    }
  };
}

export const GET = withDb(async (request: NextRequest) => {
  try {
    // During build, return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({ 
        posts: [createMockPost()]
      });
    }

    // Check if Post model is available
    if (!Post || typeof Post.find !== 'function') {
      console.error('Post model not properly initialized');
      return NextResponse.json({ posts: [] });
    }

    const posts = await Post.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .populate('userInfo', 'username role verified');

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}, { requireConnection: false }); // Allow static builds with mock data

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

    // During build, return mock response
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json({
        post: {
          ...createMockPost(),
          author: payload.userId,
          username: payload.username
        }
      });
    }

    // Check if Post model is available
    if (!Post || typeof Post.create !== 'function') {
      throw new Error('Post model not properly initialized');
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const post = new Post({
      title,
      content,
      author: payload.userId,
      username: payload.username
    });

    await post.save();
    await Post.populate(post, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}, { requireConnection: true }); // Require DB connection for writes

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'POST', 'OPTIONS']);