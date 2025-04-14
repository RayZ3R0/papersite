import React, { useState, useEffect } from 'react';
import { ToolbarBase } from '../common/ToolbarBase';
import { ToolbarState, ToolbarActions, Position } from '../../types/tools';
import useDraggable from '../../hooks/useDraggable';

export interface DesktopToolbarProps extends ToolbarState, ToolbarActions {
  initialPosition?: Position;
}

export function DesktopToolbar({
  initialPosition = { x: 20, y: 100 },
  ...toolbarProps
}: DesktopToolbarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { position, isDragging, elementRef, handlePointerDown } = useDraggable({
    initialPosition,
    bounds: true
  });

  // Ensure toolbar is properly positioned initially
  useEffect(() => {
    const timer = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.style.opacity = '1';
        elementRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(1)`;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Render toolbar header with drag handle
  const renderHeader = () => (
    <div 
      onPointerDown={handlePointerDown}
      className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
        flex items-center cursor-grab px-3.5 py-2.5 select-none toolbar-drag-handle"
      style={{ touchAction: 'none' }}
    >
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200 
        transition-opacity duration-300 ease-in-out"
      >
        Annotation
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {/* Minimize button */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
            dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
            transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={isMinimized ? "Expand toolbar" : "Minimize toolbar"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="transform transition-transform duration-300"
            style={{ transform: `rotate(${isMinimized ? 180 : 0}deg)` }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        {/* Close button */}
        <button
          onClick={() => toolbarProps.setIsVisible(false)}
          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50
            dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20
            transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Hide toolbar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="transform transition-transform duration-200 hover:rotate-90"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div 
      ref={elementRef}
      className={`fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-xl shadow-xl overflow-hidden
        z-[9999] origin-top-left
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${toolbarProps.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        ${isMinimized ? 'w-[76px]' : 'w-[300px]'}`}
      style={{ 
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isDragging ? 1.02 : 1})`,
        cursor: isDragging ? 'grabbing' : 'default',
        top: 0,
        left: 0,
        boxShadow: isDragging 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        willChange: 'transform, width, opacity',
        backfaceVisibility: 'hidden'
      }}
    >
      <ToolbarBase
        {...toolbarProps}
        variant="desktop"
        renderHeader={renderHeader}
      />
    </div>
  );
}