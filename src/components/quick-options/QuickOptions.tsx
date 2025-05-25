"use client";

import React from 'react';
import { useQuickOptions, QuickOptionsProvider } from './QuickOptionsProvider';
import MinimizedQuickOptions from './MinimizedQuickOptions';
import ExpandedQuickOptions from './ExpandedQuickOptions';

// Check if the client is using a mobile browser
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

function QuickOptions() {
  const { isMinimized } = useQuickOptions();

  // Don't render on mobile devices
  if (isMobileDevice()) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[99] mb-16">
      <div className={`
        transition-all duration-500 ease-spring
        ${isMinimized ? 'scale-100 rotate-0' : 'scale-0 rotate-90 pointer-events-none opacity-0'}
      `}>
        <MinimizedQuickOptions />
      </div>
      <div className={`
        transition-all duration-500 ease-spring
        ${isMinimized ? 'scale-0 rotate-90 pointer-events-none opacity-0' : 'scale-100 rotate-0'}
        origin-bottom-right absolute bottom-0 right-0
      `}>
        <ExpandedQuickOptions />
      </div>
    </div>
  );
}

// Wrap with provider
export function QuickOptionsWithProvider() {
  // Don't initialize on mobile devices
  if (isMobileDevice()) {
    return null;
  }

  return (
    <QuickOptionsProvider>
      <QuickOptions />
    </QuickOptionsProvider>
  );
}