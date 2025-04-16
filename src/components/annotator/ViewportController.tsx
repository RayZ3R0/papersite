import React from 'react';

interface ViewportControllerProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  onPageChange: (pageNumber: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export default function ViewportController({
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset
}: ViewportControllerProps) {
  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>
        
        <div className="text-sm">
          Page <span className="font-medium">{pageNumber}</span> of {numPages}
        </div>
        
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= numPages}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20 12H4" 
            />
          </svg>
        </button>
        
        <span className="text-sm font-medium w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={onZoomIn}
          disabled={scale >= 3}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </button>
        
        <button
          onClick={onZoomReset}
          className="ml-2 p-2 px-3 text-sm rounded bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
}