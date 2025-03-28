'use client';

import { AdminControls } from './AdminControls';
import { UserActionMenu } from './UserActionMenu';

interface PostContentProps {
  post: {
    _id: string;
    title: string;
    content: string;
    authorName: string;
    authorId: string;
    tags: string[];
    createdAt: string;
  };
  onDelete: () => void;
}

export function PostContent({ post, onDelete }: PostContentProps) {
  return (
    <article className="mb-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center text-sm text-text-muted mb-4">
        <span>By {post.authorName}</span>
        <span className="mx-2">•</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {post.tags.length > 0 && (
        <div className="mb-4 space-x-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 text-xs bg-surface-alt rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-4">
        <UserActionMenu
          authorId={post.authorId}
          createdAt={post.createdAt}
          onDelete={onDelete}
          type="post"
        />
        <AdminControls
          postId={post._id}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}