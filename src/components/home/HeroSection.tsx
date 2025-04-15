'use client';

import { ReactNode } from 'react';
import ParallaxBanner from './ParallaxBanner';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center md:-mt-16 overflow-hidden">
      <ParallaxBanner />
      
      {/* Overlay gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background z-[1]"></div>
      
      {/* Animated decorative elements */}
      <div className="absolute inset-0 z-[2] overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 -right-20 w-64 h-64 rounded-full bg-secondary/20 blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-[3]">
        <div className="w-full z-10 pt-0 md:pt-16">
          {children}
        </div>
      </div>
      
      {/* Bottom curve for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20 bg-background z-[2]" style={{
        clipPath: 'ellipse(75% 100% at 50% 100%)'
      }}></div>
    </section>
  );
}