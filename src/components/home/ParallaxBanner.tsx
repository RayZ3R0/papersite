'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function ParallaxBanner() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.2]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [reduced, setReduced] = useState(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReduced(prefersReducedMotion);
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Optimized for mobile: use an appropriate image size */}
      <motion.div
        className="w-full h-full absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/banner.jpg), linear-gradient(to bottom right, #161928, #1E2132)',
          y: reduced ? 0 : y,
          scale,
          opacity
        }}
      />
      
      {/* Floating paper elements */}
      {!reduced && (
        <>
          <motion.div
            className="absolute -top-10 left-[10%] w-16 h-20 md:w-24 md:h-32 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg"
            initial={{ y: -20, rotate: -5, opacity: 0 }}
            animate={{ 
              y: [-20, 0, -20],
              rotate: [-5, 5, -5],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div
            className="absolute top-1/4 right-[15%] w-14 h-20 md:w-20 md:h-28 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg"
            initial={{ y: 20, rotate: 10, opacity: 0 }}
            animate={{ 
              y: [20, 40, 20],
              rotate: [10, 0, 10],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ 
              duration: 14, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-[20%] w-12 h-16 md:w-16 md:h-24 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg"
            initial={{ y: 0, rotate: -8, opacity: 0 }}
            animate={{ 
              y: [0, -20, 0],
              rotate: [-8, 0, -8],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </>
      )}
    </div>
  );
}