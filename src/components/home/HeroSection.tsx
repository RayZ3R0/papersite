'use client';

import { ReactNode } from 'react';
import ParallaxBanner from './ParallaxBanner';

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center -mt-16">
      <ParallaxBanner />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full z-10">
          {children}
        </div>
      </div>
    </section>
  );
}