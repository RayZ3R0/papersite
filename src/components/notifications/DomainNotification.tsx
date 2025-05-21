'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export const DomainNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [viewportType, setViewportType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Skip notification if already on the correct domain
    const currentDomain = window.location.hostname;
    if (currentDomain === 'papernexus.xyz') {
      return;
    }

    // Check if user has already dismissed this notification
    const hasSeenNotification = localStorage.getItem('domain-notification-seen');
    if (hasSeenNotification === 'true') {
      return;
    }

    // Handle viewport size detection
    const handleResize = () => {
      setViewportType(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    
    // Initial check
    handleResize();
    
    // Set up listeners and show with delay
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => setIsVisible(true), 750);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const dismissNotification = () => {
    setIsVisible(false);
    localStorage.setItem('domain-notification-seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ 
            type: 'spring',
            stiffness: 400,
            damping: 30
          }}
          className={`
            fixed left-0 right-0 mx-auto z-[500]
            flex items-center justify-center
            px-4 ${viewportType === 'mobile' ? 'top-[60px]' : 'top-[70px]'}
          `}
        >
          <div className="
            bg-primary text-white 
            px-4 py-3 rounded-lg shadow-lg 
            flex items-center justify-between
            w-full max-w-md
          ">
            <div className="text-sm mr-3 flex-1 min-w-0">
              We&apos;ve moved! Please use our new domain:{' '}
              <a
                href="https://papernexus.xyz"
                className="font-bold underline hover:text-white/80 inline-block"
                onClick={dismissNotification}
              >
                papernexus.xyz
              </a>
            </div>
            <button
              onClick={dismissNotification}
              className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-full 
                focus:outline-none focus:ring-2 focus:ring-white/60 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DomainNotification;