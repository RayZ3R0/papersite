'use client';

import React, { useState, useEffect } from 'react';
import { ToolType, Position } from '../types';
import ToolButton from './ToolButton';
import Slider from './Slider';
import Tooltip from './Tooltip';
import ColorPicker from '../ColorPicker';
import { UndoIcon, RedoIcon, ClearIcon, SaveIcon } from '../icons';
import useDraggable from '../hooks/useDraggable';

interface DesktopToolbarProps {
  activeTool: ToolType;
  currentColor: string;
  strokeSize: number;
  opacity: number;
  canUndo: boolean;
  canRedo: boolean;
  isVisible: boolean;
  initialPosition?: Position;
  handleToolChange: (tool: ToolType) => void;
  handleColorChange: (color: string) => void;
  handleSizeChange: (size: number) => void;
  handleOpacityChange: (value: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  setIsVisible: (value: boolean) => void;
}

export default function DesktopToolbar({
  activeTool,
  currentColor,
  strokeSize,
  opacity,
  canUndo,
  canRedo,
  isVisible,
  initialPosition = { x: 20, y: 100 },
  handleToolChange,
  handleColorChange,
  handleSizeChange,
  handleOpacityChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  setIsVisible
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
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Size preview varies based on tool
  const renderSizePreview = () => {
    const previewSize = Math.min(16, strokeSize);
    
    if (activeTool === 'eraser') {
      return (
        <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
          <div className="absolute w-3 h-3 rounded-sm bg-gray-400 dark:bg-gray-500 opacity-50" />
          <div className="absolute rounded-full border-2 border-blue-500 dark:border-blue-400" 
            style={{ 
              width: `${previewSize}px`, 
              height: `${previewSize}px` 
            }} 
          />
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <div className="rounded-full" 
          style={{ 
            width: `${previewSize}px`, 
            height: `${previewSize}px`, 
            backgroundColor: activeTool === 'highlighter' 
              ? `${currentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` 
              : currentColor 
          }} 
        />
      </div>
    );
  };

  
  return (
    <div 
      ref={elementRef}
      className={`fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-xl shadow-xl overflow-hidden transition-opacity duration-300 ease-in-out
        z-[9999]
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${isMinimized ? 'w-[76px]' : 'w-[300px]'} max-h-[90vh] overflow-y-auto`}
      style={{ 
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        cursor: isDragging ? 'grabbing' : 'default',
        top: 0,
        left: 0,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Toolbar header with drag handle */}
      <div 
        onPointerDown={handlePointerDown}
        className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
          flex items-center cursor-grab px-3.5 py-2.5 select-none toolbar-drag-handle"
        style={{
          touchAction: 'none'
        }}
      >
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Annotation</div>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Minimize button */}
          <Tooltip content={isMinimized ? "Expand toolbar" : "Minimize toolbar"}>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
                dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                transition-colors duration-150"
              aria-label={isMinimized ? "Expand toolbar" : "Minimize toolbar"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMinimized ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          </Tooltip>
          
          {/* Close button */}
          <Tooltip content="Hide toolbar">
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50
                dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20
                transition-colors duration-150"
              aria-label="Hide toolbar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
      
      {/* Rest of the component remains the same... */}
      
      {/* Expanded view */}
      {!isMinimized && (
        <div className="p-4 space-y-6">
          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Tools
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
                <button
                  key={tool}
                  onClick={() => handleToolChange(tool)}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all duration-200
                    ${activeTool === tool 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                    }`}
                >
                  {tool === 'pen' && (
                    <svg className="w-5 h-5 mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  )}
                  {tool === 'highlighter' && (
                    <svg className="w-5 h-5 mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                  )}
                  {tool === 'eraser' && (
                    <svg className="w-5 h-5 mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 20H7L3 16c-1.5-1.5-1.5-3.5 0-5l9-9c1.5-1.5 3.5-1.5 5 0l5 5c1.5 1.5 1.5 3.5 0 5l-7 7"></path>
                      <path d="M8.5 16 15 9.5"></path>
                    </svg>
                  )}
                  <span className="text-xs font-medium capitalize">
                    {tool}
                  </span>
                  
                  {/* Keyboard shortcut indicator */}
                  <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
                    <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 
                      text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                      {tool.charAt(0).toUpperCase()}
                    </kbd>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Settings
            </h3>
            
            {/* Color picker (not for eraser) */}
            {activeTool !== 'eraser' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Color</span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{currentColor}</span>
                </div>
                <ColorPicker
                  currentColor={currentColor}
                  onColorChange={handleColorChange}
                />
              </div>
            )}
            
            {/* Size slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {activeTool === 'eraser' ? 'Eraser Size' : 'Stroke Size'}
                </span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{strokeSize}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSizeChange(Math.max(1, strokeSize - 1))}
                  disabled={strokeSize <= 1}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
                    dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={strokeSize}
                    onChange={(e) => handleSizeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-blue-500
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:transition-transform
                      [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                </div>
                
                <button
                  onClick={() => handleSizeChange(Math.min(20, strokeSize + 1))}
                  disabled={strokeSize >= 20}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
                    dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                
                {renderSizePreview()}
              </div>
            </div>
            
            {/* Opacity slider (only for highlighter) */}
            {activeTool === 'highlighter' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Opacity</span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{opacity.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpacityChange(Math.max(0.1, Number((opacity - 0.1).toFixed(1))))}
                    disabled={opacity <= 0.1}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
                      dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0.1}
                      max={0.5}
                      step={0.1}
                      value={opacity}
                      onChange={(e) => handleOpacityChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-blue-500
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleOpacityChange(Math.min(0.5, Number((opacity + 0.1).toFixed(1))))}
                    disabled={opacity >= 0.5}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
                      dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <div className="w-full h-full rounded" 
                      style={{ backgroundColor: `${currentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Actions
            </h3>
            
            {/* History actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
                  bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                  border border-gray-200 dark:border-gray-700 shadow-sm
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]
                  transition-all duration-150"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 14L4 9l5-5"/>
                  <path d="M4 9h11a4 4 0 0 1 4 4v3"/>
                </svg>
                <span className="text-sm font-medium">Undo</span>
              </button>

              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
                  bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                  border border-gray-200 dark:border-gray-700 shadow-sm
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]
                  transition-all duration-150"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 14l5-5-5-5"/>
                  <path d="M20 9H9a4 4 0 0 0-4 4v3"/>
                </svg>
                <span className="text-sm font-medium">Redo</span>
              </button>
            </div>

            {/* Document actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClear}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
                  bg-gray-50 dark:bg-gray-800 hover:bg-red-50 hover:text-red-600
                  dark:hover:bg-red-900/20 dark:hover:text-red-400
                  border border-gray-200 dark:border-gray-700 shadow-sm
                  active:scale-[0.98] transition-all duration-150"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
                <span className="text-sm font-medium">Clear</span>
              </button>

              <button
                onClick={onSave}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
                  bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                  hover:bg-blue-100 dark:hover:bg-blue-900/50
                  border border-blue-200 dark:border-blue-800/50 shadow-sm
                  active:scale-[0.98] transition-all duration-150"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span className="text-sm font-medium">Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized view - Fixed alignment issues */}
      {isMinimized && (
        <div className="p-2 flex flex-col gap-2">
          {/* Header - Added for minimized view */}
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate text-center pb-1">
            Annotation
          </div>
      
          {/* Tools */}
          <div className="flex flex-col space-y-1">
            {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
              <Tooltip key={tool} content={tool.charAt(0).toUpperCase() + tool.slice(1)} position="right">
                <button
                  onClick={() => handleToolChange(tool)}
                  className={`group relative rounded-md w-full h-10 flex items-center justify-center transition-all duration-200
                    ${activeTool === tool 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {tool === 'pen' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  )}
                  {tool === 'highlighter' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                  )}
                  {tool === 'eraser' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 20H7L3 16c-1.5-1.5-1.5-3.5 0-5l9-9c1.5-1.5 3.5-1.5 5 0l5 5c1.5 1.5 1.5 3.5 0 5l-7 7"></path>
                      <path d="M8.5 16 15 9.5"></path>
                    </svg>
                  )}
                  
                  <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="text-[8px] font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 
                      text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                      {tool.charAt(0).toUpperCase()}
                    </kbd>
                  </div>
                </button>
              </Tooltip>
            ))}
          </div>
      
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
      
          {/* Color preview in minimized view (if not eraser) */}
          {activeTool !== 'eraser' && (
            <Tooltip content="Color" position="right">
              <button
                onClick={() => setIsMinimized(false)}
                className="w-full h-10 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ 
                    backgroundColor: activeTool === 'highlighter' 
                      ? `${currentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` 
                      : currentColor
                  }}
                ></div>
              </button>
            </Tooltip>
          )}
      
          {/* Size control with fixed layout issues */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 flex flex-col items-center border border-gray-200 dark:border-gray-700">
            {/* Preview at the top, centered */}
            <div className="flex justify-center mb-1.5">
              {renderSizePreview()}
            </div>
            
            {/* Size value */}
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 text-center">
              Size: {strokeSize}
            </div>
            
            {/* Size controls - Fixed button overflow */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => handleSizeChange(Math.max(1, strokeSize - 1))}
                disabled={strokeSize <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              
              <button
                onClick={() => handleSizeChange(Math.min(20, strokeSize + 1))}
                disabled={strokeSize >= 20}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
      
          {/* Action buttons - Fixed right alignment */}
          <div className="grid grid-cols-2 gap-2">
            <Tooltip content={canUndo ? "Undo" : "Nothing to undo"} position="right">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150
                  flex items-center justify-center h-10 w-full"
                aria-label="Undo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 14L4 9l5-5"/>
                  <path d="M4 9h11a4 4 0 0 1 4 4v3"/>
                </svg>
              </button>
            </Tooltip>
            
            <Tooltip content={canRedo ? "Redo" : "Nothing to redo"} position="right">
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150
                  flex items-center justify-center h-10 w-full"
                aria-label="Redo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 14l5-5-5-5"/>
                  <path d="M20 9H9a4 4 0 0 0-4 4v3"/>
                </svg>
              </button>
            </Tooltip>
          </div>
      
          <div className="grid grid-cols-2 gap-2">
            <Tooltip content="Clear all annotations" position="right">
              <button
                onClick={onClear}
                className="p-0 rounded-md hover:bg-red-50 hover:text-red-600
                  dark:hover:bg-red-900/20 dark:hover:text-red-400
                  transition-all duration-150 flex items-center justify-center h-10 w-full"
                aria-label="Clear annotations"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </Tooltip>
            
            <Tooltip content="Save PDF with annotations" position="right">
              <button
                onClick={onSave}
                className="p-0 rounded-md hover:bg-blue-50 hover:text-blue-600
                  dark:hover:bg-blue-900/20 dark:hover:text-blue-400
                  transition-all duration-150 flex items-center justify-center h-10 w-full"
                aria-label="Save PDF"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </Tooltip>
          </div>
      
          {/* Expand button */}
          <button
            onClick={() => setIsMinimized(false)}
            className="mt-1 w-full py-2 rounded-md bg-gray-50 dark:bg-gray-800 
              hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300
              border border-gray-200 dark:border-gray-700 shadow-sm
              text-xs font-medium flex items-center justify-center gap-1"
          >
            <span>More</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}