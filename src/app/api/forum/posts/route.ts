import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { Post } from '@/models/Post';

export const dynamic = 'force-dynamic';

const handleGetPosts = async (request: NextRequest) => {
  try {
    // Verify user auth
    await requireAuth();
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'lastReplyAt';
    const order = searchParams.get('order') || 'desc';

    // Build query
    const query = Post.find()
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userInfo', 'username role verified');

    // Get posts and total count
    const [posts, total] = await Promise.all([
      query.exec(),
      Post.countDocuments()
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
};

const handleCreatePost = async (request: NextRequest) => {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Get post data
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create post
    const post = new Post({
      title,
      content,
      author: user._id || user.userId,
      username: user.username
    });

    await post.save();

    // Populate user info
    await Post.populate(post, {
      path: 'userInfo',
      select: 'username role verified'
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const GET = withDb(handleGetPosts, { requireConnection: false });
export const POST = withDb(handleCreatePost, { requireConnection: true });

// Handle CORS preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}