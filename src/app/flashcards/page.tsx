'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FLASHCARD_CONFIG } from '@/lib/data/flashcard-config';
import {
  FlashcardCollection as IFlashcardCollection,
  CollectionResponse
} from '@/types/flashcard';

type SelectEvent = ChangeEvent<HTMLSelectElement>;

export default function FlashcardsPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [collections, setCollections] = useState<IFlashcardCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      try {
        const params = new URLSearchParams();
        if (selectedSubject) params.set('subject', selectedSubject);
        if (selectedUnit) params.set('unit', selectedUnit);

        const response = await fetch(`/api/flashcards?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch collections');

        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      fetchCollections();
    }
  }, [profile, selectedSubject, selectedUnit]);

  if (profileLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get selected subject config
  const currentSubject = selectedSubject 
    ? FLASHCARD_CONFIG.SUBJECTS.find(s => s.id === selectedSubject)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-[56px] md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4 md:py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-text">Flashcards</h1>
            <p className="text-text-muted mt-1">
              Create and study flashcards for your subjects
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters - Mobile Dropdown / Desktop Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Subject Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e: SelectEvent) => {
                  setSelectedSubject(e.target.value);
                  setSelectedUnit(''); // Reset unit when subject changes
                }}
                className="w-full p-2 rounded-md bg-surface-alt border border-border"
              >
                <option value="">All Subjects</option>
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
                <label className="block text-sm font-medium text-text">
                  Unit
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e: SelectEvent) => setSelectedUnit(e.target.value)}
                  className="w-full p-2 rounded-md bg-surface-alt border border-border"
                >
                  <option value="">All Units</option>
                  {currentSubject.units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Create Collection Button */}
            <button
              onClick={() => router.push('/flashcards/new')}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 
                transition-colors text-sm font-medium"
            >
              Create Collection
            </button>
          </div>

          {/* Collections Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted">No flashcard collections found</p>
                <button
                  onClick={() => router.push('/flashcards/new')}
                  className="mt-4 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 
                    transition-colors text-sm font-medium"
                >
                  Create Your First Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection: IFlashcardCollection) => (
                  <div
                    key={collection._id.toString()}
                    onClick={() => router.push(`/flashcards/${collection._id}`)}
                    className="p-4 bg-surface-alt rounded-lg border border-border hover:border-primary/30 
                      hover:bg-surface-hover cursor-pointer transition-all"
                  >
                    <h3 className="font-medium text-text">{collection.name}</h3>
                    <p className="text-sm text-text-muted mt-1">
                      {collection.cardCount} cards
                    </p>
                    {/* Subject and Unit tags */}
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                        {FLASHCARD_CONFIG.SUBJECTS.find(s => s.id === collection.subjectId)?.name}
                      </span>
                      {collection.unitId && (
                        <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md">
                          {FLASHCARD_CONFIG.SUBJECTS
                            .find(s => s.id === collection.subjectId)
                            ?.units.find(u => u.id === collection.unitId)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}