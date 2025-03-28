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

    // Get IP from header (set by middleware)
    const ip = request.headers.get('x-real-ip') || '127.0.0.1';

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
      authorId: body.authorId,
      ip
    });

    // Don't send back the IP address
    const replyObject = reply.toObject();
    delete replyObject.ip;

    return NextResponse.json(replyObject, { status: 201 });
  } catch (error) {
    console.error('Failed to create reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}

// Delete a post (for user self-deletion)
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    const ip = request.headers.get('x-real-ip') || '127.0.0.1';

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
      authorId: authorId,
      ip: ip // Verify IP matches
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if post is within delete window (15 minutes)
    const deleteWindow = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (Date.now() - post.createdAt.getTime() > deleteWindow) {
      return NextResponse.json(
        { error: 'Post can only be deleted within 15 minutes of creation' },
        { status: 403 }
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