'use client';

import { useState, useRef, TouchEvent } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PDFViewerProps {
  paperUrl: string;
  markingSchemeUrl: string;
  title: string;
}

export default function PDFViewer({ paperUrl, markingSchemeUrl, title }: PDFViewerProps) {
  const [activeView, setActiveView] = useState<'paper' | 'scheme'>('paper');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const touchStartX = useRef<number>(0);
  const SWIPE_THRESHOLD = 50; // minimum distance for swipe

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX.current;

    if (Math.abs(swipeDistance) >= SWIPE_THRESHOLD) {
      if (swipeDistance > 0 && activeView === 'scheme') {
        // Swipe right, show paper
        setActiveView('paper');
      } else if (swipeDistance < 0 && activeView === 'paper') {
        // Swipe left, show scheme
        setActiveView('scheme');
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Mobile View Switcher */}
      {!isDesktop && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView('paper')}
            className={`flex-1 py-4 text-center min-h-[44px] ${
              activeView === 'paper'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
            aria-label="View Question Paper"
          >
            Question Paper
          </button>
          <button
            onClick={() => setActiveView('scheme')}
            className={`flex-1 py-4 text-center min-h-[44px] ${
              activeView === 'scheme'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
            aria-label="View Marking Scheme"
          >
            Marking Scheme
          </button>
        </div>
      )}

      {/* PDF Display Area */}
      <div 
        className={`flex-1 ${isDesktop ? 'flex' : 'block'}`}
        onTouchStart={!isDesktop ? handleTouchStart : undefined}
        onTouchEnd={!isDesktop ? handleTouchEnd : undefined}
      >
        {/* Question Paper */}
        <div
          className={`h-full ${
            isDesktop
              ? 'w-1/2 border-r border-gray-200'
              : activeView === 'paper'
              ? 'block'
              : 'hidden'
          }`}
        >
          <iframe
            src={paperUrl}
            className="w-full h-full"
            title={`${title} - Question Paper`}
            loading="lazy"
          />
        </div>

        {/* Marking Scheme */}
        <div
          className={`h-full ${
            isDesktop
              ? 'w-1/2'
              : activeView === 'scheme'
              ? 'block'
              : 'hidden'
          }`}
        >
          <iframe
            src={markingSchemeUrl}
            className="w-full h-full"
            title={`${title} - Marking Scheme`}
            loading="lazy"
          />
        </div>
      </div>

      {/* Mobile Swipe Indicator */}
      {!isDesktop && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
          <div 
            className="bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-full transform transition-opacity duration-300"
            style={{ opacity: '0.8' }}
          >
            Swipe to switch views • {activeView === 'paper' ? 'Swipe left for marking scheme' : 'Swipe right for paper'}
          </div>
        </div>
      )}

      {/* Performance Monitoring */}
      <div className="hidden">
        <div id="pdf-load-time" data-url={paperUrl} />
        <div id="pdf-switch-time" data-view={activeView} />
      </div>
    </div>
  );
}