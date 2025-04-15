'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PaperSearch from '@/components/search/PaperSearch';
import { useInView } from 'react-intersection-observer';

function SearchHeader() {
  const { ref, inView } = useInView({
    threshold: 0,
    initialInView: true,
  });

  return (
    <div 
      ref={ref} 
      className={`sticky top-14 z-10 pt-4 pb-2 px-4 md:px-0 md:static 
        bg-background backdrop-blur-sm md:backdrop-blur-none
        transition-opacity duration-200
        ${inView ? 'opacity-100' : 'opacity-0'}`}
    >
      <h1 className="text-xl md:text-3xl font-bold mb-2 md:mb-8 text-text md:text-center">
        Find Past Papers
      </h1>
      <p className="text-sm md:text-xl font-light mb-2 md:mb-8 text-text-muted md:text-center">
        The Unit Codes given may not be accurate. Check the files properly.
      </p>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [isClient, setIsClient] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-surface shadow-sm border border-border p-4 md:p-6 h-[500px] flex items-center justify-center sm:rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface shadow-sm border border-border p-4 md:p-6 sm:rounded-lg">
      <PaperSearch initialQuery={initialQuery} />
    </div>
  );
}

export default function SearchPage() {
  // Improve iOS scroll handling
  useEffect(() => {
    // Fix for iOS 100vh issue
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height', 
        `${window.innerHeight}px`
      );
    };
    
    // Initial set
    setAppHeight();
    
    // Update on resize
    window.addEventListener('resize', setAppHeight);
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background py-0 sm:py-4 md:py-8 px-0 sm:px-2 md:px-4" 
          style={{ minHeight: 'var(--app-height, 100vh)' }}>
      <div className="max-w-6xl mx-auto">
        <SearchHeader />
        
        <Suspense fallback={
          <div className="bg-surface shadow-sm border border-border p-4 md:p-6 text-center h-[400px] flex items-center justify-center sm:rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </main>
  );
}