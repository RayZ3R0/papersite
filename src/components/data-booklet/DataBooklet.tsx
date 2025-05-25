"use client";

import React, { useEffect } from 'react';
import { useDataBooklet, DataBookletProvider } from './DataBookletProvider';
import MinimizedDataBooklet from './MinimizedDataBooklet';
import ExpandedDataBooklet from './ExpandedDataBooklet';

// Check if the client is using a mobile browser
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface DataBookletProps {
  subject: string;
}

function DataBookletContent({ subject }: DataBookletProps) {
  const { isMinimized, isVisible, setIsVisible, setSubject } = useDataBooklet();

  // Set subject and show/hide based on subject type
  useEffect(() => {
    const shouldShow = subject === 'chemistry' || subject === 'mathematics';
    setSubject(subject);
    setIsVisible(shouldShow);
  }, [subject, setSubject, setIsVisible]);

  // Don't render on mobile devices or if not visible
  if (isMobileDevice() || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[98] mb-32">
      <div className={`
        transition-all duration-500 ease-spring
        ${isMinimized ? 'scale-100 rotate-0' : 'scale-0 rotate-90 pointer-events-none opacity-0'}
      `}>
        <MinimizedDataBooklet />
      </div>
      <div className={`
        transition-all duration-500 ease-spring
        ${isMinimized ? 'scale-0 rotate-90 pointer-events-none opacity-0' : 'scale-100 rotate-0'}
        origin-bottom-right absolute bottom-0 right-0
      `}>
        <ExpandedDataBooklet />
      </div>
    </div>
  );
}

// Wrap with provider
export function DataBookletWithProvider({ subject }: DataBookletProps) {
  // Don't initialize on mobile devices
  if (isMobileDevice()) {
    return null;
  }

  return (
    <DataBookletProvider>
      <DataBookletContent subject={subject} />
    </DataBookletProvider>
  );
}

export default DataBookletWithProvider;