'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FLASHCARD_CONFIG } from '@/lib/data/flashcard-config';

export default function NewCollectionPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [error, setError] = useState('');

  // Get selected subject config
  const currentSubject = selectedSubject 
    ? FLASHCARD_CONFIG.SUBJECTS.find(s => s.id === selectedSubject)
    : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          subjectId: selectedSubject,
          unitId: selectedUnit || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create collection');
      }

      const collection = await response.json();
      router.push(`/flashcards/${collection._id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-[56px] md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4 md:py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-text">Create Collection</h1>
            <p className="text-text-muted mt-1">
              Create a new flashcard collection
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Collection Name */}
            <div className="space-y-2">
              <label 
                htmlFor="name"
                className="block text-sm font-medium text-text"
              >
                Collection Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Enter collection name"
                required
                className="w-full p-2 rounded-md bg-surface-alt border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>

            {/* Subject Select */}
            <div className="space-y-2">
              <label 
                htmlFor="subject"
                className="block text-sm font-medium text-text"
              >
                Subject
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSelectedSubject(e.target.value);
                  setSelectedUnit(''); // Reset unit when subject changes
                }}
                required
                className="w-full p-2 rounded-md bg-surface-alt border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              >
                <option value="">Select Subject</option>
                {FLASHCARD_CONFIG.SUBJECTS.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Select - Only show if subject is selected */}
            {currentSubject && (
              <div className="space-y-2">
                <label 
                  htmlFor="unit"
                  className="block text-sm font-medium text-text"
                >
                  Unit (Optional)
                </label>
                <select
                  id="unit"
                  value={selectedUnit}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedUnit(e.target.value)}
                  className="w-full p-2 rounded-md bg-surface-alt border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                >
                  <option value="">Select Unit</option>
                  {currentSubject.units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 
                transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Collection'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}