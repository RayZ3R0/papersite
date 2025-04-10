'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";

interface UserInfo {
  role: string;
  verified: boolean;
}

interface Reply {
  _id: string;
  content: string;
  author: string;
  username: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  userInfo?: UserInfo;
}

interface ApiResponse {
  success: boolean;
  data: {
    reply: Reply;
  };
  message?: string;
}

interface ReplyEditorProps {
  postId: string;
  onReplyCreated?: (response: ApiResponse) => void;
  className?: string;
}

export default function ReplyEditor({ 
  postId, 
  onReplyCreated, 
  className = "" 
}: ReplyEditorProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      const data: ApiResponse = await response.json();
      setContent("");
      if (onReplyCreated) {
        onReplyCreated(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className={`bg-surface rounded-lg shadow-sm border border-divider overflow-hidden ${className}`}>
      <form onSubmit={handleSubmit} className="divide-y divide-divider">
        {/* Editor Area */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-surface border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-text-muted/50 resize-y min-h-[100px]"
            maxLength={10000}
          />
        </div>

        {/* Footer with Counter and Submit */}
        <div className="px-4 py-3 bg-surface-alt/10 flex items-center justify-between">
          <div className="text-sm text-text-muted">
            {content.length}/10000
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`
              px-4 py-2 bg-primary text-white rounded-md
              hover:bg-primary/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2 text-sm font-medium
            `}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span>Post Reply</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 text-sm bg-error/10 text-error border-t border-error/20">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}