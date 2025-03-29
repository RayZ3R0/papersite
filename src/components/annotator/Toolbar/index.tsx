'use client';

import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ColorPicker from './ColorPicker';
import {
  PenIcon,
  HighlighterIcon,
  EraserIcon,
  UndoIcon,
  RedoIcon,
  ClearIcon,
  SaveIcon,
} from './icons';

export type ToolType = 'pen' | 'highlighter' | 'eraser';

interface ToolbarProps {
  onToolChange?: (tool: ToolType) => void;
  onColorChange?: (color: string) => void;
  onSizeChange?: (size: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  currentTool?: ToolType;
  currentColor?: string;
  currentSize?: number;
  currentOpacity?: number;
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  preview?: React.ReactNode;
}

function Slider({ value, onChange, min, max, step = 1, label, preview }: SliderProps) {
  return (
    <div className="group relative">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-xs font-medium text-text-muted whitespace-nowrap">{label}</div>
        {preview}
        <div className="text-xs font-medium ml-auto">
          {typeof value === 'number' && Number.isInteger(value) ? value : value.toFixed(1)}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-surface-alt rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:hover:shadow-md
          hover:[&::-webkit-slider-thumb]:bg-primary/90
          
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-primary
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow
          [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

// Tooltip component for enhanced UX
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="group relative">
      {children}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 
        text-xs bg-background text-text border border-border shadow-lg
        px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50">
        {content}
      </div>
    </div>
  );
}

export default function Toolbar({
  onToolChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo = false,
  canRedo = false,
  currentTool: externalTool,
  currentColor: externalColor,
  currentSize: externalSize,
  currentOpacity: externalOpacity,
}: ToolbarProps) {
  // Use provided values or default to internal state
  const [activeTool, setActiveTool] = useState<ToolType>(externalTool || 'pen');
  const [currentColor, setCurrentColor] = useState(externalColor || '#000000');
  const [strokeSize, setStrokeSize] = useState(externalSize || 5);
  const [opacity, setOpacity] = useState(externalOpacity || 0.3);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // For draggable functionality
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Handle drag functionality
  const handleMouseDown = (e: ReactMouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.toolbar-drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep toolbar within viewport bounds
      const maxX = window.innerWidth - (toolbarRef.current?.offsetWidth || 300);
      const maxY = window.innerHeight - (toolbarRef.current?.offsetHeight || 400);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners for dragging
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Sync with external values if provided
  useEffect(() => {
    if (externalTool !== undefined) setActiveTool(externalTool);
  }, [externalTool]);

  useEffect(() => {
    if (externalColor !== undefined) setCurrentColor(externalColor);
  }, [externalColor]);
  
  useEffect(() => {
    if (externalSize !== undefined) setStrokeSize(externalSize);
  }, [externalSize]);
  
  useEffect(() => {
    if (externalOpacity !== undefined) setOpacity(externalOpacity);
  }, [externalOpacity]);

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    onToolChange?.(tool);
    // Update opacity when tool changes
    onOpacityChange?.(tool === 'highlighter' ? opacity : 1);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onColorChange?.(color);
  };

  const handleSizeChange = (size: number) => {
    setStrokeSize(size);
    onSizeChange?.(size);
  };

  const handleOpacityChange = (value: number) => {
    if (activeTool === 'highlighter') {
      setOpacity(value);
      onOpacityChange?.(value);
    }
  };
  
  // Size preview varies based on tool
  const renderSizePreview = () => {
    const previewSize = Math.min(16, strokeSize);
    
    if (activeTool === 'eraser') {
      return (
        <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
          <div className="absolute w-3 h-3 rounded-sm bg-text-muted opacity-50" />
          <div className="absolute rounded-full border border-primary" 
            style={{ 
              width: `${previewSize}px`, 
              height: `${previewSize}px` 
            }} 
          />
        </div>
      );
    }
    
    return (
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
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
  
  // Opacity preview
  const renderOpacityPreview = () => (
    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
      <div className="rounded-sm w-full h-full" 
        style={{ backgroundColor: `${currentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` }} 
      />
    </div>
  );

  // Keyboard shortcut indicators
  const getShortcutLabel = (tool: ToolType) => {
    switch (tool) {
      case 'pen': return 'P';
      case 'highlighter': return 'H';
      case 'eraser': return 'E';
      default: return '';
    }
  };
  
  // Toggle toolbar visibility button - positioned at a fixed location
  const renderToggleButton = () => (
    <button
      onClick={() => setIsVisible(!isVisible)}
      className={`fixed ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-50 p-2.5 rounded-full 
        bg-background border border-border/90 shadow-md hover:shadow-lg
        transition-all duration-300 hover:bg-surface-alt
        ${isVisible ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
      aria-label={isVisible ? 'Hide toolbar' : 'Show toolbar'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isVisible ? (
          // Hide icon (double chevron right)
          <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
        ) : (
          // Show icon (double chevron left)
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
        )}
      </svg>
    </button>
  );

  // For mobile, we use a horizontal layout at the bottom
  if (isMobile) {
    return (
      <div className="relative z-40">
        {renderToggleButton()}
        
        <div 
          ref={toolbarRef} 
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-background border border-border/90
            rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
            max-w-[95vw] w-[420px]`}
          style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
        >
          {/* Drag handle for mobile */}
          <div 
            className="h-1.5 w-16 bg-border/40 rounded-full mx-auto my-1.5 toolbar-drag-handle"
            onMouseDown={handleMouseDown}
            onTouchStart={() => {/* Handle touch for mobile dragging */}}
          />
          
          {/* Main row with toggle */}
          <div className="flex items-center w-full p-2.5 border-b border-border">
            {/* Tools */}
            <div className="flex gap-1.5 flex-1">
              {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
                <Tooltip key={tool} content={`${tool.charAt(0).toUpperCase() + tool.slice(1)} (${getShortcutLabel(tool)})`}>
                  <button
                    onClick={() => handleToolChange(tool)}
                    className={`p-2.5 rounded-lg transition-all duration-200 relative
                      ${activeTool === tool 
                        ? 'bg-primary/15 text-primary ring-1 ring-primary/30 shadow-sm' 
                        : 'hover:bg-surface-alt active:scale-95 text-text'
                      }
                    `}
                  >
                    {tool === 'pen' && <PenIcon className="w-5 h-5" />}
                    {tool === 'highlighter' && <HighlighterIcon className="w-5 h-5" />}
                    {tool === 'eraser' && <EraserIcon className="w-5 h-5" />}
                  </button>
                </Tooltip>
              ))}
            </div>
            
            {/* Color picker */}
            {activeTool !== 'eraser' && (
              <div className="mx-2 flex-shrink-0" style={{ width: '80px' }}>
                <ColorPicker
                  currentColor={currentColor}
                  onColorChange={handleColorChange}
                />
              </div>
            )}
            
            {/* Undo/Redo */}
            <div className="flex gap-1.5">
              <Tooltip content="Undo (Ctrl+Z)">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-2.5 rounded-lg transition-all duration-200 hover:bg-surface-alt
                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <UndoIcon className="w-5 h-5" />
                </button>
              </Tooltip>
              <Tooltip content="Redo (Ctrl+Y)">
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-2.5 rounded-lg transition-all duration-200 hover:bg-surface-alt
                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <RedoIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            
            {/* Minimize/Expand toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 ml-1 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isExpanded 
                  ? <polyline points="18 15 12 9 6 15"></polyline>
                  : <polyline points="6 9 12 15 18 9"></polyline>
                }
              </svg>
            </button>
          </div>
          
          {/* Expandable section */}
          <div 
            className="transition-all duration-300 ease-in-out overflow-hidden"
            style={{ 
              maxHeight: isExpanded ? '200px' : '0px',
              opacity: isExpanded ? 1 : 0
            }}
          >
            <div className="px-4 pt-2 pb-3 grid grid-cols-2 gap-4">
              {/* Size slider */}
              <div>
                <Slider
                  value={strokeSize}
                  onChange={handleSizeChange}
                  min={1}
                  max={20}
                  label={`${activeTool === 'eraser' ? 'Eraser' : 'Stroke'} Size`}
                  preview={renderSizePreview()}
                />
              </div>
              
              {/* Opacity slider (only for highlighter) */}
              {activeTool === 'highlighter' ? (
                <div>
                  <Slider
                    value={opacity}
                    onChange={handleOpacityChange}
                    min={0.1}
                    max={0.5}
                    step={0.1}
                    label="Opacity"
                    preview={renderOpacityPreview()}
                  />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Tooltip content="Clear Page">
                    <button
                      onClick={onClear}
                      className="flex-1 py-2 px-3 rounded-lg transition-all duration-200 
                        bg-surface hover:bg-red-100/70 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
                        border border-border/80 text-xs font-medium
                        active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ClearIcon className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Save as PDF">
                    <button
                      onClick={onSave}
                      className="flex-1 py-2 px-3 rounded-lg transition-all duration-200 
                        bg-surface hover:bg-primary/10 hover:text-primary
                        border border-border/80 text-xs font-medium shadow-sm
                        active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <SaveIcon className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop view - draggable vertical toolbar
  return (
    <div className="relative z-40">
      {renderToggleButton()}
      
      <div 
        ref={toolbarRef} 
        onMouseDown={handleMouseDown}
        className={`fixed bg-background border border-border/90
          rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out
          ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          ${isMinimized ? 'w-[70px]' : 'w-[300px]'} max-h-[90vh] overflow-y-auto`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Toolbar header with drag handle */}
        <div className="border-b border-border/80 flex items-center toolbar-drag-handle cursor-grab px-3 py-2 bg-surface/50">
          <div className="text-sm font-medium">PDF Annotation</div>
          <div className="ml-auto flex items-center space-x-1.5">
            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-text"
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
            
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 rounded hover:bg-surface-alt hover:bg-red-100/50 hover:text-red-600 text-text-muted"
              aria-label="Hide toolbar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Toolbar content */}
        <div className={`p-4 flex flex-col gap-5 ${isMinimized ? 'hidden' : ''}`}>
          {/* Tool Buttons */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider flex items-center">
              <span className="h-px flex-grow bg-border/80 mr-2"></span>
              Tools
              <span className="h-px flex-grow bg-border/80 ml-2"></span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
                <Tooltip key={tool} content={`${tool.charAt(0).toUpperCase() + tool.slice(1)} (${getShortcutLabel(tool)})`}>
                  <button
                    onClick={() => handleToolChange(tool)}
                    className={`py-3 px-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 relative
                      ${activeTool === tool 
                        ? 'bg-primary/15 text-primary ring-1 ring-primary/30 shadow-sm' 
                        : 'hover:bg-surface-alt active:scale-95 text-text'
                      }
                    `}
                  >
                    {tool === 'pen' && <PenIcon className="w-6 h-6" />}
                    {tool === 'highlighter' && <HighlighterIcon className="w-6 h-6" />}
                    {tool === 'eraser' && <EraserIcon className="w-6 h-6" />}
                    <span className="text-[11px] font-medium capitalize">{tool}</span>
                    <kbd className="absolute top-1.5 right-1.5 text-[8px] opacity-70 px-1 rounded bg-surface-alt">
                      {getShortcutLabel(tool)}
                    </kbd>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          
          {/* Tool Settings */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider flex items-center">
              <span className="h-px flex-grow bg-border/80 mr-2"></span>
              Settings
              <span className="h-px flex-grow bg-border/80 ml-2"></span>
            </h3>
            
            <div className="space-y-4 py-1">
              {/* Color (Not for eraser) */}
              {activeTool !== 'eraser' && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-muted">Color</span>
                    <span className="text-xs font-mono">{currentColor}</span>
                  </div>
                  <ColorPicker
                    currentColor={currentColor}
                    onColorChange={handleColorChange}
                  />
                </div>
              )}
              
              {/* Size Slider */}
              <div>
                <Slider
                  value={strokeSize}
                  onChange={handleSizeChange}
                  min={1}
                  max={20}
                  label={`${activeTool === 'eraser' ? 'Eraser' : 'Stroke'} Size`}
                  preview={renderSizePreview()}
                />
              </div>
              
              {/* Opacity Slider (only for highlighter) */}
              {activeTool === 'highlighter' && (
                <div>
                  <Slider
                    value={opacity}
                    onChange={handleOpacityChange}
                    min={0.1}
                    max={0.5}
                    step={0.1}
                    label="Opacity"
                    preview={renderOpacityPreview()}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider flex items-center">
              <span className="h-px flex-grow bg-border/80 mr-2"></span>
              Actions
              <span className="h-px flex-grow bg-border/80 ml-2"></span>
            </h3>
            
            <div className="space-y-3">
              {/* History Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="py-2.5 px-3 rounded-lg transition-all duration-200 
                    bg-surface border border-border/80 shadow-sm
                    hover:bg-surface-alt/80
                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                    flex items-center justify-center gap-2"
                >
                  <UndoIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Undo</span>
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="py-2.5 px-3 rounded-lg transition-all duration-200 
                    bg-surface border border-border/80 shadow-sm
                    hover:bg-surface-alt/80
                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                    flex items-center justify-center gap-2"
                >
                  <RedoIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Redo</span>
                </button>
              </div>
              
              {/* Document Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onClear}
                  className="py-2.5 px-3 rounded-lg transition-all duration-200 
                    bg-surface border border-border/80 shadow-sm
                    hover:bg-red-100/70 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
                    active:scale-95 flex items-center justify-center gap-2"
                >
                  <ClearIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Clear Page</span>
                </button>
                <button
                  onClick={onSave}
                  className="py-2.5 px-3 rounded-lg transition-all duration-200 
                    bg-surface border border-border/80 shadow-sm
                    hover:bg-primary/10 hover:text-primary
                    active:scale-95 flex items-center justify-center gap-2"
                >
                  <SaveIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Minimized View */}
        {isMinimized && (
          <div className="p-2 flex flex-col gap-3 items-center">
            {/* Tool buttons in minimized view */}
            <div className="flex flex-col gap-1.5">
              {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
                <Tooltip key={tool} content={`${tool.charAt(0).toUpperCase() + tool.slice(1)} (${getShortcutLabel(tool)})`}>
                  <button
                    onClick={() => handleToolChange(tool)}
                    className={`p-2 rounded-lg transition-all duration-200
                      ${activeTool === tool 
                        ? 'bg-primary/15 text-primary ring-1 ring-primary/30' 
                        : 'hover:bg-surface-alt active:scale-95 text-text'
                      }`}
                  >
                    {tool === 'pen' && <PenIcon className="w-5 h-5" />}
                    {tool === 'highlighter' && <HighlighterIcon className="w-5 h-5" />}
                    {tool === 'eraser' && <EraserIcon className="w-5 h-5" />}
                  </button>
                </Tooltip>
              ))}
            </div>
            
            <div className="h-px w-full bg-border/80 my-0.5"></div>
            
            {/* Color preview in minimized view */}
            {activeTool !== 'eraser' && (
              <div className="w-full">
                <Tooltip content="Change color">
                  <button 
                    className="w-full flex items-center justify-center p-1.5 hover:bg-surface-alt rounded-lg"
                    onClick={() => setIsMinimized(false)} // Expand to access color picker
                  >
                    <div 
                      className="w-8 h-8 rounded-full border border-border/80 shadow-sm" 
                      style={{ backgroundColor: currentColor }}
                    ></div>
                  </button>
                </Tooltip>
              </div>
            )}
            
            <div className="h-px w-full bg-border/80 my-0.5"></div>
            
            {/* Action buttons in minimized view */}
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <Tooltip content="Undo (Ctrl+Z)">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-alt
                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                    flex items-center justify-center"
                >
                  <UndoIcon className="w-5 h-5" />
                </button>
              </Tooltip>
              
              <Tooltip content="Redo (Ctrl+Y)">
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-alt
                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                    flex items-center justify-center"
                >
                  <RedoIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            
            <div className="h-px w-full bg-border/80 my-0.5"></div>
            
            {/* Size controls */}
            <div className="w-full px-1">
              <div className="flex justify-between mb-1">
                <button 
                  onClick={() => handleSizeChange(Math.max(1, strokeSize - 1))}
                  className="text-xs rounded p-1 hover:bg-surface-alt"
                  disabled={strokeSize <= 1}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className="flex items-center justify-center">
                  {renderSizePreview()}
                </div>
                <button 
                  onClick={() => handleSizeChange(Math.min(20, strokeSize + 1))}
                  className="text-xs rounded p-1 hover:bg-surface-alt"
                  disabled={strokeSize >= 20}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Clear and save in minimized view */}
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <Tooltip content="Clear Page">
                <button
                  onClick={onClear}
                  className="p-2 rounded-lg transition-all duration-200 
                    hover:bg-red-100/70 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
                    active:scale-95 flex items-center justify-center"
                >
                  <ClearIcon className="w-5 h-5" />
                </button>
              </Tooltip>
              
              <Tooltip content="Save PDF">
                <button
                  onClick={onSave}
                  className="p-2 rounded-lg transition-all duration-200 
                    hover:bg-primary/10 hover:text-primary
                    active:scale-95 flex items-center justify-center"
                >
                  <SaveIcon className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            
            {/* Expand button */}
            <div className="mt-1 w-full">
              <button 
                onClick={() => setIsMinimized(false)}
                className="w-full py-1.5 text-xs font-medium text-text-muted
                  hover:bg-surface-alt rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>Expand</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 6 9 12 15 18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
