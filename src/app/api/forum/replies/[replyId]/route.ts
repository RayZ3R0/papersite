import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Reply } from '@/models/Reply';
import { Post } from '@/models/Post';
import { canModifyContent } from '@/lib/forumUtils';
import mongoose from 'mongoose';

// Delete a reply (for user self-deletion)
export async function DELETE(
  request: Request,
  { params }: { params: { replyId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');
    const ip = request.headers.get('x-real-ip') || '127.0.0.1';

    if (!mongoose.Types.ObjectId.isValid(params.replyId)) {
      return NextResponse.json(
        { error: 'Invalid reply ID' },
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

    const reply = await Reply.findById(params.replyId)
      .select('+ip'); // Include IP field which is normally hidden

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Verify user can modify this reply
    const verification = canModifyContent(reply, authorId, ip, true);
    if (!verification.allowed) {
      return NextResponse.json(
        { error: verification.reason },
        { status: 403 }
      );
    }

    // Delete the reply and update post's reply count
    await reply.deleteOne();
    await Post.findByIdAndUpdate(reply.postId, {
      $inc: { replyCount: -1 }
    });

    return NextResponse.json(
      { message: 'Reply deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
}