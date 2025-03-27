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

    // Rate limiting check could be added here
    
    await connectToDatabase();
    
    const post = await Post.create({
      title: body.title.trim(),
      content: body.content.trim(),
      authorName: body.authorName.trim(),
      authorId: body.authorId,
      tags: body.tags?.filter((tag: string) => tag.trim()) || []
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}