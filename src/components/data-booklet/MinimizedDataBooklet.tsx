"use client";

import React from 'react';
import { useDataBooklet } from './DataBookletProvider';
import { BookOpenIcon } from '@heroicons/react/24/outline';

export default function MinimizedDataBooklet() {
  const { toggleMinimized, subject } = useDataBooklet();

  const getTitle = () => {
    if (subject === 'chemistry') return 'Data Booklet';
    if (subject === 'mathematics') return 'Formula Book';
    return 'Reference';
  };

//   const getIcon = () => {
//     if (subject === 'chemistry') return '🧪';
//     if (subject === 'mathematics') return '📐';
//     return '📖';
//   };

  return (
    <button
      onClick={toggleMinimized}
      className="group bg-surface hover:bg-surface-alt border border-border rounded-full
        shadow-lg hover:shadow-xl transition-all duration-300 ease-spring p-3
        hover:scale-110 active:scale-95 music-player-fade-in
        hover:border-primary/30"
      aria-label={`Open ${getTitle()}`}
    >
      <div className="flex items-center justify-center">
        {/* <span className="text-lg mr-2">{getIcon()}</span> */}
        <BookOpenIcon className="w-5 h-5 text-text group-hover:text-primary transition-colors duration-300" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2
        bg-surface border border-border rounded-lg px-3 py-2 shadow-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        pointer-events-none whitespace-nowrap z-50">
        <span className="text-sm font-medium text-text">{getTitle()}</span>
        <div className="absolute left-full top-1/2 transform -translate-y-1/2">
          <div className="border-4 border-transparent border-l-border"></div>
        </div>
      </div>

      <style jsx global>{`
        .music-player-fade-in {
          animation: playerFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes playerFadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </button>
  );
}