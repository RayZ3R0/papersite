'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export const DomainNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on the primary domain - if so, don't show notification
    const hostname = window.location.hostname;
    if (hostname === 'papernexus.xyz' || hostname === 'www.papernexus.xyz') {
      return;
    }

    // Check if user has dismissed this notification before
    const hasSeenNotification = localStorage.getItem('domain-notification-seen') === 'true';
    if (hasSeenNotification) {
      return;
    }

    // Detect mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    // Show notification with a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);
    
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
          className="fixed left-0 right-0 w-full z-[500] flex justify-center px-4"
          style={{ 
            top: isMobile ? '60px' : '70px'
          }}
        >
          <div className="
            bg-primary text-white 
            px-4 py-3 rounded-lg shadow-lg 
            flex items-center gap-3
            w-full max-w-md
          ">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DomainNotification;