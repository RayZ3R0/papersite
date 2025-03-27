import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { Reply } from '@/models/Reply';
import mongoose from 'mongoose';

// Get a single post with its replies
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const replies = await Reply.find({ postId: params.postId })
      .sort({ createdAt: 1 });

    return NextResponse.json({ post, replies });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// Add a reply to a post
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await request.json();

    if (!body.content?.trim() || !body.authorName?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify post exists
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const reply = await Reply.create({
      postId: params.postId,
      content: body.content.trim(),
      authorName: body.authorName.trim(),
      authorId: body.authorId
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Failed to create reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');

    if (!mongoose.Types.ObjectId.isValid(params.postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    if (!authorId) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const post = await Post.findOne({
      _id: params.postId,
      authorId: authorId
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete all replies first
    await Reply.deleteMany({ postId: params.postId });
    
    // Then delete the post
    await post.deleteOne();

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}