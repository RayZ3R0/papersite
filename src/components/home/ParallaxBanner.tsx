'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ParallaxBanner() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      if (!parallaxRef.current) return;
      const scrolled = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Dark gradient overlay - Full coverage with proper fade 
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70 z-[1]" />*/}

      {/* Background image with parallax */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
      >
        <Image
          src="/banner.jpg"
          alt="Homepage banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      </div>
    </>
  );
}