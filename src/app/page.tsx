'use client';

import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Banner with Suspense */}
      <Suspense fallback={
        <div className="h-[60vh] bg-background-alt animate-pulse" />
      }>
        <HeroSection />
      </Suspense>

      {/* Content Container - Will be used in future phases */}
      <div className="container mx-auto px-4 py-12">
        {/* Feature grid and other content will go here */}
      </div>
    </main>
  );
}
