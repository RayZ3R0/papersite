'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaperSearch from '@/components/search/PaperSearch';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border p-4 md:p-6">
      <PaperSearch initialQuery={initialQuery} />
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
        <p className="text-2xl md:text-3xl font-extralight mb-8 text-center text-text">The Unit Codes given may not be accurate. Check the files properly.</p>
        
        <Suspense fallback={
          <div className="bg-surface rounded-lg shadow-sm border border-border p-4 md:p-6 text-center">
            Loading search...
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </main>
  );
}