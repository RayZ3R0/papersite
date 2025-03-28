'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface ParallaxBannerProps {
  className?: string;
}

export default function ParallaxBanner({ className = '' }: ParallaxBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    let ticking = false;
    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      if (!container || !image) return;
      const scrolled = window.scrollY;
      const speed = 0.5; // Parallax speed (0.5 = half speed of scroll)
      const yPos = -(scrolled * speed);
      image.style.transform = `translate3d(0, ${yPos}px, 0)`;
      lastScrollY = scrolled;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[40vh] md:h-[60vh] overflow-hidden ${className}`}
    >
      {/* Parallax Image Container */}
      <div 
        ref={imageRef}
        className="absolute inset-0 h-[120%] -top-[10%]"
      >
        <Image
          src="/banner.jpg"
          alt="Banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
    </div>
  );
}