'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const DomainNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentDomain = window.location.hostname;
    if (currentDomain === 'papernexus.xyz') return;

    const hasSeenNotification = localStorage.getItem('domain-notification-seen');
    if (!hasSeenNotification) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissNotification = () => {
    setIsVisible(false);
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
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md sm:max-w-lg md:max-w-xl bg-primary text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
          style={{
            boxSizing: 'border-box',
            width: '95vw',
            maxWidth: 400,
            minWidth: 0,
            wordBreak: 'break-word',
          }}
        >
          <p className="text-sm flex-1">
            We've moved! Please use our new domain:
            <a
              href="https://papernexus.xyz"
              className="font-bold underline ml-1 hover:text-white/80 break-all"
              onClick={dismissNotification}
              tabIndex={0}
            >
              papernexus.xyz
            </a>
          </p>
          <button
            onClick={dismissNotification}
            className="ml-2 p-2 hover:bg-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Dismiss notification"
            style={{ flexShrink: 0 }}
          >
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DomainNotification;