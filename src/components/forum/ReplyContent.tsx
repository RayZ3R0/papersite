'use client';

import { AdminControls } from './AdminControls';
import { UserActionMenu } from './UserActionMenu';

interface ReplyContentProps {
  reply: {
    _id: string;
    content: string;
    authorName: string;
    authorId: string;
    createdAt: string;
  };
  postId: string;
  onDelete: () => void;
}

export function ReplyContent({ reply, postId, onDelete }: ReplyContentProps) {
  return (
    <div className="p-4 bg-surface rounded">
      <div className="flex items-center text-sm text-text-muted mb-2">
        <span>{reply.authorName}</span>
        <span className="mx-2">•</span>
        <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        {reply.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-2 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-2">
        <UserActionMenu
          authorId={reply.authorId}
          createdAt={reply.createdAt}
          onDelete={onDelete}
          type="reply"
        />
        <AdminControls
          postId={postId}
          replyId={reply._id}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}