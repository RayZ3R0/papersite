'use client';

import { useEffect, useRef } from 'react';
import ParallaxBanner from './ParallaxBanner';
import HomeSearch from './HomeSearch';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export default function HeroSection({ 
  title = "Welcome to Papersite",
  subtitle = "Find papers, books, and notes for your studies"
}: HeroSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Fade in title on mount
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.opacity = '0';
      titleRef.current.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        if (titleRef.current) {
          titleRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          titleRef.current.style.opacity = '1';
          titleRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Parallax Background */}
      <ParallaxBanner />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <h1 
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
        >
          {title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto text-white/90 mb-8">
          {subtitle}
        </p>

        {/* Search Component */}
        <HomeSearch className="mt-2 opacity-0 animate-fade-in" />
      </div>

      {/* Bottom Fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}