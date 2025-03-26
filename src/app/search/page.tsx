'use client';

import PaperSearch from '@/components/search/PaperSearch';

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Find Past Papers
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <PaperSearch />
        </div>
      </div>
    </main>
  );
}