import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/models/Post';
import { withDb, handleOptions } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth/validation';

export const GET = withDb(async (request: NextRequest) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
});

export const POST = withDb(async (request: NextRequest) => {
  try {
    // Verify user authentication
    const payload = await requireAuth();

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

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export const OPTIONS = () => handleOptions(['GET', 'POST', 'OPTIONS']);