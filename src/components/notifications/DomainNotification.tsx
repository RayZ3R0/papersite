'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const DomainNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user is already on the new domain
    const currentDomain = window.location.hostname;
    if (currentDomain === 'papernexus.xyz') {
      return;
    }

    // Check if the user has seen this notification before
    const hasSeenNotification = localStorage.getItem('domain-notification-seen');
    
    if (!hasSeenNotification) {
      // Show notification after a slight delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissNotification = () => {
    setIsVisible(false);
    // Mark notification as seen
    localStorage.setItem('domain-notification-seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-md"
        >
          <p className="text-sm">
            We've moved! Please use our new domain: 
            <a 
              href="https://papernexus.xyz" 
              className="font-bold underline ml-1 hover:text-white/80"
              onClick={dismissNotification}
            >
              papernexus.xyz
            </a>
          </p>
          <button 
            onClick={dismissNotification} 
            className="p-1 hover:bg-white/20 rounded-full"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DomainNotification;