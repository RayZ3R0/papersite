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
      className="px-4 md:px-0 pt-4 pb-2 bg-background"
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
      <div className="bg-surface shadow-sm border border-border p-4 md:p-6 h-[500px] flex items-center justify-center sm:rounded-lg search-card-mobile-fix">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface shadow-sm border border-border p-4 md:p-6 sm:rounded-lg search-card-mobile-fix">
      <PaperSearch initialQuery={initialQuery} />
    </div>
  );
}

export default function SearchPage() {
  // Fix for mobile issues
  useEffect(() => {
    // Handle global scroll behavior
    const fixMobileLayout = () => {
      document.documentElement.classList.add('fixed-search-page');
      
      // Also fix any iOS specific issues
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.documentElement.classList.add('ios-search-page');
      }
      
      return () => {
        document.documentElement.classList.remove('fixed-search-page');
        document.documentElement.classList.remove('ios-search-page');
      };
    };
    
    const cleanup = fixMobileLayout();
    
    // iOS 100vh issue fix
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height', 
        `${window.innerHeight}px`
      );
    };
    
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    
    // Reapply on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(setAppHeight, 100);
    });
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
      cleanup();
    };
  }, []);

  return (
    <main 
      className="min-h-screen bg-background overflow-x-hidden fixed-content"
    >
      <div className="max-w-6xl mx-auto pt-1">
        <SearchHeader />
        
        <Suspense fallback={
          <div className="bg-surface shadow-sm border border-border p-4 md:p-6 text-center h-[400px] flex items-center justify-center sm:rounded-lg search-card-mobile-fix">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </main>
  );
}