'use client';

import { Suspense, useEffect, useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import HomeSearch from '@/components/home/HomeSearch';
import ActionGrid from '@/components/home/QuickAccess/ActionGrid';
import RecentPapers from '@/components/home/RecentPapers';
import StatisticsSection from '@/components/home/StatisticsSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import FaqSection from '@/components/home/FaqSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add a small delay to allow the page to fully render for smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Hero Section with Improved Animation */}
      <HeroSection>
        <div className="text-center px-4 max-w-4xl mx-auto mb-4 md:mb-8">
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find Past Papers <span className="text-primary">in Seconds</span>
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-white/80 mb-4 md:mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Access thousands of A-Level past papers, mark schemes, and study materials
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Suspense fallback={
              <div className="w-full h-12 bg-white/10 animate-pulse rounded-xl"></div>
            }>
              <HomeSearch className="w-full" />
            </Suspense>
          </motion.div>
        </div>
      </HeroSection>
      
      {/* Adjust the ActionGrid component positioning for mobile */}
      <div className="-mt-6 md:-mt-0">
        <ActionGrid />
      </div>
      
      {/* Recently Added Papers Section - now with balanced display 
      <RecentPapers />
      */}
      
      {/* Statistics Section */}
      <StatisticsSection />
      
      {/* Social Proof/Testimonials */}
      <TestimonialSection />
      
      {/* FAQ Section */}
      <FaqSection />
      
      {/* Newsletter Section */}
      <NewsletterSection />
    </main>
  );
}