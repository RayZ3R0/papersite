'use client';

import { useSearchParams } from 'next/navigation';
import PaperSearch from '@/components/search/PaperSearch';
import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const shouldFocus = searchParams.get('focus') === 'true';
  const initialQuery = searchParams.get('q') || '';

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border p-4 md:p-6">
      <PaperSearch autoFocus={shouldFocus} initialQuery={initialQuery} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center text-text">
          Find Past Papers
        </h1>
        
        <Suspense fallback={<div className="bg-surface rounded-lg shadow-sm border border-border p-4 md:p-6 text-center">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </div>
    </main>
  );
}