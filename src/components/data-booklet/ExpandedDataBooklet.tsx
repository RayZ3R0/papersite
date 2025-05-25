"use client";

import React, { useRef, useEffect } from 'react';
import { useDataBooklet } from './DataBookletProvider';
import { 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function ExpandedDataBooklet() {
  const { toggleMinimized, subject } = useDataBooklet();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getUrl = () => {
    if (subject === 'chemistry') {
      return 'https://cdn.papernexus.xyz/booklets/chemistry.pdf';
    }
    if (subject === 'mathematics') {
      return 'https://cdn.papernexus.xyz/booklets/math.pdf';
    }
    return '';
  };

  const getTitle = () => {
    if (subject === 'chemistry') return 'Chemistry Data Booklet';
    if (subject === 'mathematics') return 'Mathematics Formula Book';
    return 'Reference Material';
  };

  const openInNewTab = () => {
    window.open(getUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-[50vw] h-[60vh] bg-surface border border-border rounded-lg
      shadow-lg overflow-hidden music-player-fade-in hover:shadow-xl
      transition-all duration-300 ease-spring flex flex-col">
      
      {/* Header - Clickable to minimize */}
      <div 
        className="flex items-center justify-between p-4 border-b border-border
          bg-surface hover:bg-surface-alt transition-all duration-300 group cursor-pointer
          hover:border-primary/30 flex-shrink-0"
        onClick={toggleMinimized}
      >
        <h3 className="text-sm font-medium group-hover:text-primary transition-colors duration-300 flex items-center">
          <BookOpenIcon className="w-4 h-4 mr-2" />
          {getTitle()}
          <span className="text-xs text-text-muted ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            (click to minimize)
          </span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openInNewTab();
            }}
            className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimized();
            }}
            className="text-text-muted hover:text-primary rounded-full p-1 
              hover:bg-surface transition-all duration-300 hover:rotate-90
              hover:scale-110 active:scale-95"
            aria-label="Minimize data booklet"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-2 bg-surface-alt/50">
        <iframe
          ref={iframeRef}
          src={getUrl()}
          className="w-full h-full rounded border border-border bg-white"
          title={getTitle()}
          loading="lazy"
        />
      </div>

      {/* Footer with info */}
      <div className="px-4 py-2 border-t border-border bg-surface-alt/30 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Official {subject === 'chemistry' ? 'Edexcel' : 'Pearson'} reference material</span>
          <button
            onClick={openInNewTab}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            Open in new tab
          </button>
        </div>
      </div>

      {/* Add global styles matching music player */}
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
    </div>
  );
}