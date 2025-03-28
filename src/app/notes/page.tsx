'use client';

import { useState } from 'react';
import SubjectFilter from '@/components/books/SubjectFilter';

// Temporary data structure - move to proper data file later
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

export default function NotesPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        <SubjectFilter
          subjects={subjects}
          selectedSubject={selectedSubject}
          onChange={setSelectedSubject}
        />
      </div>

      {/* Grid will be similar to books but with different card design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-surface p-4 rounded-lg">
          {/* Placeholder for note cards */}
          <p className="text-text-muted">Notes coming soon...</p>
        </div>
      </div>
    </div>
  );
}