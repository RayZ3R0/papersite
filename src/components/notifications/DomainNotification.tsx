'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const DomainNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on the correct domain already - if so, don't show notification
    const currentDomain = window.location.hostname;
    if (currentDomain === 'papernexus.xyz') {
      return;
    }

    // Check if user has dismissed this notification before
    const hasSeenNotification = localStorage.getItem('domain-notification-seen');
    if (hasSeenNotification === 'true') {
      return;
    }
    
    // Detect if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Show notification with a slight delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed left-1/2 -translate-x-1/2 z-[9999] 
            bg-primary text-white px-4 py-3 rounded-lg shadow-lg 
            flex items-center gap-3 w-[95vw] max-w-md
            ${isMobile ? 'top-[68px]' : 'top-[76px]'}
          `}
        >
          <div className="text-sm flex-1">
            We&apos;ve moved! Please use our new domain:{' '}
            <a
              href="https://papernexus.xyz"
              className="font-bold underline hover:text-white/80"
              onClick={dismissNotification}
            >
              papernexus.xyz
            </a>
          </div>
          <button
            onClick={dismissNotification}
            className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Dismiss notification"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DomainNotification;