'use client';

import { useState, useEffect, useRef } from 'react';
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
      <div className="flex items-center gap-2 mb-1">
        <div className="text-xs text-text-muted whitespace-nowrap">{label}</div>
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
        className="w-full h-1.5 bg-surface-alt/50 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:hover:shadow-md
          hover:[&::-webkit-slider-thumb]:bg-primary/90"
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
        text-xs bg-background/90 text-text border border-border/50 backdrop-blur-sm shadow-lg
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
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const toolbarRef = useRef<HTMLDivElement>(null);

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
    setOpacity(value);
    onOpacityChange?.(value);
  };

  // Update tool settings when switching tools
  useEffect(() => {
    if (activeTool === 'highlighter') {
      onOpacityChange?.(opacity);
    } else {
      onOpacityChange?.(1);
    }
  }, [activeTool, opacity, onOpacityChange]);
  
  // Size preview varies based on tool
  const renderSizePreview = () => {
    const previewSize = Math.min(16, strokeSize);
    
    if (activeTool === 'eraser') {
      return (
        <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
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
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
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
    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
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

  // For mobile and tablet, we use a horizontal layout
  if (isMobile) {
    return (
      <div ref={toolbarRef} className="bg-background/95 backdrop-blur-lg border border-border/60 
        rounded-xl shadow-lg overflow-hidden min-h-[64px] flex flex-col transition-all duration-300">
        
        {/* Main row with toggle */}
        <div className="flex items-center w-full p-2">
          {/* Tools */}
          <div className="flex gap-1 flex-1">
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
            <div className="mx-2">
              <ColorPicker
                currentColor={currentColor}
                onColorChange={handleColorChange}
              />
            </div>
          )}
          
          {/* Undo/Redo */}
          <div className="flex gap-1">
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
          
          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 ml-1 rounded-md hover:bg-surface-alt text-text-muted hover:text-text"
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
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-4">
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
              <div className="flex gap-2">
                <Tooltip content="Clear Page">
                  <button
                    onClick={onClear}
                    className="flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
                      border border-border text-xs font-medium
                      active:scale-95 flex items-center justify-center gap-1"
                  >
                    <ClearIcon className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </Tooltip>
                <Tooltip content="Save as PDF">
                  <button
                    onClick={onSave}
                    className="flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary
                      border border-border text-xs font-medium
                      active:scale-95 flex items-center justify-center gap-1"
                  >
                    <SaveIcon className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Desktop view - vertical toolbar
  return (
    <div ref={toolbarRef} className="bg-background/95 backdrop-blur-lg border border-border/60 
      rounded-xl shadow-lg overflow-hidden w-[270px] transition-all duration-300">
      <div className="p-4 flex flex-col gap-5">
        {/* Tool Buttons */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Tools</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
              <Tooltip key={tool} content={`${tool.charAt(0).toUpperCase() + tool.slice(1)} (${getShortcutLabel(tool)})`}>
                <button
                  onClick={() => handleToolChange(tool)}
                  className={`py-2 px-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1.5 relative
                    ${activeTool === tool 
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30' 
                      : 'hover:bg-surface-alt active:scale-95 text-text'
                    }
                  `}
                >
                  {tool === 'pen' && <PenIcon className="w-5 h-5" />}
                  {tool === 'highlighter' && <HighlighterIcon className="w-5 h-5" />}
                  {tool === 'eraser' && <EraserIcon className="w-5 h-5" />}
                  <span className="text-[10px] capitalize">{tool}</span>
                  <kbd className="absolute top-1 right-1 text-[8px] opacity-70 px-1 rounded bg-surface-alt">
                    {getShortcutLabel(tool)}
                  </kbd>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
        
        {/* Separator */}
        <div className="h-px bg-border/60 -mx-1" />
        
        {/* Tool Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Settings</h3>
          
          {/* Color (Not for eraser) */}
          {activeTool !== 'eraser' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">Color</span>
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
        
        {/* Separator */}
        <div className="h-px bg-border/60 -mx-1" />
        
        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Actions</h3>
          
          {/* History Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Tooltip content="Undo (Ctrl+Z)">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-alt
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                  flex items-center justify-center gap-1.5"
              >
                <UndoIcon className="w-4 h-4" />
                <span className="text-xs">Undo</span>
              </button>
            </Tooltip>
            <Tooltip content="Redo (Ctrl+Y)">
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-alt
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                  flex items-center justify-center gap-1.5"
              >
                <RedoIcon className="w-4 h-4" />
                <span className="text-xs">Redo</span>
              </button>
            </Tooltip>
          </div>
          
          {/* Document Actions */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Tooltip content="Clear all annotations on this page">
              <button
                onClick={onClear}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
                  border border-border
                  active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ClearIcon className="w-4 h-4" />
                <span className="text-xs">Clear Page</span>
              </button>
            </Tooltip>
            <Tooltip content="Save annotated PDF">
              <button
                onClick={onSave}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary
                  border border-border
                  active:scale-95 flex items-center justify-center gap-1.5"
              >
                <SaveIcon className="w-4 h-4" />
                <span className="text-xs">Save PDF</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}