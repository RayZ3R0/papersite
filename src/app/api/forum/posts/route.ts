import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models/Post';

// Get all posts or filter by tags
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    await connectToDatabase();

    const query = tag ? { tags: tag } : {};
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title authorName tags replyCount createdAt');

    return NextResponse.json({
      posts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.title?.trim() || !body.content?.trim() || !body.authorName?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP from header (set by middleware)
    const ip = request.headers.get('x-real-ip') || '127.0.0.1';
    
    await connectToDatabase();
    
    const post = await Post.create({
      title: body.title.trim(),
      content: body.content.trim(),
      authorName: body.authorName.trim(),
      authorId: body.authorId,
      ip,
      tags: body.tags?.filter((tag: string) => tag.trim()) || []
    });

    // Don't send back the IP address
    const postObject = post.toObject();
    delete postObject.ip;

    return NextResponse.json(postObject, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}