import React, { useState } from 'react';
import { ToolbarBase } from '../common/ToolbarBase';
import { ToolbarState, ToolbarActions } from '../../types/tools';

export interface MobileToolbarProps extends ToolbarState, ToolbarActions {}

export function MobileToolbar(props: MobileToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Render toolbar header
  const renderHeader = () => (
    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 
        transition-opacity duration-200"
      >
        {showSettings ? 'Tool Settings' : 'Annotation Tools'}
      </h2>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-2 rounded-lg transition-all duration-300 ease-in-out
          transform ${showSettings ? 'rotate-180 scale-110' : 'rotate-0'}
          ${showSettings 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="transform transition-transform duration-300"
        >
          {showSettings ? (
            <path d="M19 12H5M12 19l-7-7 7-7" />
          ) : (
            <>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );

  return (
    <div 
      className={`fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 
        border-t border-gray-200 dark:border-gray-700 
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${props.isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'}`}
      style={{
        zIndex: 50,
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        maxHeight: '80vh',
        willChange: 'transform, opacity'
      }}
    >
      <div className={`transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${showSettings ? 'max-h-[80vh]' : 'max-h-[25vh]'}`}
      >
        <ToolbarBase
          {...props}
          variant="mobile"
          renderHeader={renderHeader}
        />
      </div>
    </div>
  );
}