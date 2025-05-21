'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const isUrlUpdate = useRef(false);

  // Initialize state from URL parameters
  useEffect(() => {
    const subjectId = searchParams.get('subject');
    const unitId = searchParams.get('unit');
    
    // Skip effect if we're already updating URL programmatically
    if (isUrlUpdate.current) {
      isUrlUpdate.current = false;
      return;
    }

    // Only on initial mount or when URL changes externally
    if (subjectId) {
      const subject = notesData.subjects.find(s => s.id === subjectId);
      if (subject) {
        setSelectedSubject(subject);
        
        if (unitId) {
          const unit = subject.units.find(u => u.id === unitId);
          if (unit) {
            setSelectedUnit(unit);
          } else {
            setSelectedUnit(null);
          }
        } else {
          setSelectedUnit(null);
        }
      }
    } else if (!isInitialMount.current) {
      // If URL is cleared and not initial mount, clear selections
      setSelectedSubject(null);
      setSelectedUnit(null);
    }
    
    isInitialMount.current = false;
  }, [searchParams]);

  // Update URL when selection changes
  const updateSubject = (subject: Subject | null) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    
    // Set flag to indicate we're updating URL programmatically
    isUrlUpdate.current = true;
    
    // Update URL
    if (subject) {
      router.push(`/notes?subject=${subject.id}`);
    } else {
      router.push('/notes');
    }
  };

  const updateUnit = (unit: Unit | null) => {
    setSelectedUnit(unit);
    
    // Set flag to indicate we're updating URL programmatically
    isUrlUpdate.current = true;
    
    // Update URL
    if (selectedSubject && unit) {
      router.push(`/notes?subject=${selectedSubject.id}&unit=${unit.id}`);
    } else if (selectedSubject) {
      router.push(`/notes?subject=${selectedSubject.id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-text">Notes</h1>
        <p className="text-text-muted mt-1">
          Browse study notes by subject and unit. [Disclaimer: Not all of these notes were made by me; credit goes to the respective persons who created them.]
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Filters Section */}
        <div className="w-full sm:w-64 flex-shrink-0">
          <NotesFilter
            subjects={notesData.subjects}
            selectedSubject={selectedSubject}
            selectedUnit={selectedUnit}
            onSubjectChange={updateSubject}
            onUnitChange={updateUnit}
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