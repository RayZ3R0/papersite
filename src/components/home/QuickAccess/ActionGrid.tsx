'use client';

import { useRef, useEffect, useState } from 'react';
import ActionCard from './ActionCard';
import { quickActions } from '@/config/quickActions';
import { motion, useInView } from 'framer-motion';

export default function ActionGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [staggered, setStaggered] = useState(false);
  
  useEffect(() => {
    if (isInView) {
      setStaggered(true);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto px-4 -mt-16 md:-mt-12 pt-20 md:pt-24 pb-20 relative z-10"
    >
      {/* Subtle background highlights - no grain texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Clean, minimal background orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[300px] rounded-full bg-primary/3 mix-blend-normal blur-[140px] transform -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[300px] rounded-full bg-secondary/3 mix-blend-normal blur-[140px] transform translate-y-1/2" />
      </div>
      
      {/* Elegant section header */}
      <motion.div 
        className="text-center mb-12 md:mb-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
          Quick Access
        </h2>
        <p className="text-text-muted max-w-xl mx-auto">
          Everything you need, just one click away
        </p>
        
        {/* Elegant separator line */}
        <motion.div 
          className="w-16 h-1 bg-primary/80 rounded-full mx-auto mt-6"
          initial={{ width: 0, opacity: 0 }}
          animate={isInView ? { width: 64, opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </motion.div>

      {/* Card grid with improved spacing and layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-5 md:gap-6 relative z-10">
        {quickActions.map((action, index) => (
          <motion.div 
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={staggered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5, 
              delay: Math.min(0.2 + index * 0.07, 0.8),
              ease: "easeOut"
            }}
          >
            <ActionCard action={action} />
          </motion.div>
        ))}
      </div>
      
      {/* Minimalist helper text */}
      <motion.div 
        className="flex items-center justify-center mt-12 space-x-2 text-text-muted"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Need more options? Try our{" "}
          <a href="/search" className="text-primary font-medium hover:text-primary-dark hover:underline transition-colors">
            Advanced Search
          </a>
        </p>
      </motion.div>
    </section>
  );
}