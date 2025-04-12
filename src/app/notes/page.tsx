'use client';

import { useState } from 'react';
import NotesFilter from '@/components/notes/NotesFilter';
import NotesGrid from '@/components/notes/NotesGrid';
import { NotesErrorBoundary } from '@/components/error/NotesErrorBoundary';
import { Subject, Unit, NotesData } from '@/types/note';
import rawNotesData from '@/lib/data/notes.json';

// Type assertion for the imported JSON
const notesData = rawNotesData as NotesData;

export default function NotesPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-text">Notes</h1>
        <p className="text-text-muted mt-1">
          Browse study notes by subject and unit
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Filters Section */}
        <div className="w-full sm:w-64 flex-shrink-0">
          <NotesFilter
            subjects={notesData.subjects}
            selectedSubject={selectedSubject}
            selectedUnit={selectedUnit}
            onSubjectChange={(subject) => {
              setSelectedSubject(subject);
              setSelectedUnit(null);
            }}
            onUnitChange={setSelectedUnit}
          />
        </div>

        {/* Notes Grid */}
        <div className="flex-1 min-w-0">
          {selectedSubject ? (
            <NotesErrorBoundary>
              <NotesGrid
                key={selectedSubject.id} // Force remount when subject changes
                subject={selectedSubject}
                selectedUnit={selectedUnit}
              />
            </NotesErrorBoundary>
          ) : (
            // Subject Selection Message
            <div className="text-center py-12 px-4 bg-surface rounded-lg border border-border">
              <h3 className="text-lg font-medium text-text">
                Select a subject to view notes
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Choose from the available subjects to browse notes and resources
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}