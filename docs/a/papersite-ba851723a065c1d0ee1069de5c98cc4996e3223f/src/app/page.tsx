'use client';

import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import HomeSearch from '@/components/home/HomeSearch';
import ActionGrid from '@/components/home/QuickAccess/ActionGrid';

// Wrap HomeSearch in its own component to handle focus state
function SearchWrapper() {
  return (
    <HomeSearch className="w-full" />
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background">
      <HeroSection>
        <Suspense>
          <SearchWrapper />
        </Suspense>
      </HeroSection>
      
      <ActionGrid />
    </main>
  );
}
