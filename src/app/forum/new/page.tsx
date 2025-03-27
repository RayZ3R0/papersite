'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForumUser, requireUser } from '@/hooks/useForumUser';
import { LoadingSpinner } from '@/components/forum/LoadingSpinner';

export default function NewPostPage() {
  const router = useRouter();
  const { user, isLoading } = useForumUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to forum page if no user
  if (!user) {
    router.push('/forum');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      requireUser(user);

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          tags: formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean),
          authorName: user.name,
          authorId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      router.push('/forum');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded bg-background text-text"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="content" className="block mb-1 font-medium">
            Content
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full p-2 border rounded bg-background text-text min-h-[200px]"
            required
            maxLength={10000}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block mb-1 font-medium">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full p-2 border rounded bg-background text-text"
            placeholder="Enter tags separated by commas"
          />
          <p className="mt-1 text-sm text-text-muted">
            Separate tags with commas (e.g., chemistry, unit 1, exam)
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-text-muted hover:text-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}