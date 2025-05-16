'use client';

import React, { useState } from 'react';
import { ToolType } from '../types';
import ToolButton from './ToolButton';
import Slider from './Slider';
import Tooltip from './Tooltip';
import ColorPicker from '../ColorPicker';
import { UndoIcon, RedoIcon, ClearIcon, SaveIcon, SettingsIcon } from '../icons';

interface MobileToolbarProps {
  activeTool: ToolType;
  currentColor: string;
  strokeSize: number;
  opacity: number;
  isVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
  handleToolChange: (tool: ToolType) => void;
  handleColorChange: (color: string) => void;
  handleSizeChange: (size: number) => void;
  handleOpacityChange: (value: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;
}

export default function MobileToolbar({
  activeTool,
  currentColor,
  strokeSize,
  opacity,
  isVisible,
  canUndo,
  canRedo,
  handleToolChange,
  handleColorChange,
  handleSizeChange,
  handleOpacityChange,
  onUndo,
  onRedo,
  onClear,
  onSave
}: MobileToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div 
      className={`toolbar fixed inset-x-0 bottom-0 bg-background/95 backdrop-blur-md
        border-t border-border/90 transition-all duration-300 ease-in-out z-40
        ${isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
    >
      {/* Main toolbar */}
      <div className="p-2 flex items-center justify-between border-b border-border/80">
        {/* Tools */}
        <div className="flex gap-1">
          {(['pen', 'highlighter', 'eraser'] as const).map(tool => (
            <ToolButton
              key={tool}
              tool={tool}
              activeTool={activeTool}
              onClick={handleToolChange}
              size="sm"
            />
          ))}
        </div>

        {/* Settings toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-all duration-200
            ${showSettings ? 'bg-primary/10 text-primary' : 'hover:bg-surface-alt'}
          `}
          aria-label="Toggle settings"
          aria-expanded={showSettings}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>

        {/* Actions */}
        <div className="flex gap-1">
          <Tooltip content="Undo" position="top">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-alt
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UndoIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="Redo" position="top">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-alt
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RedoIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Settings panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-background
        ${showSettings ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="p-4 space-y-4 border-t border-border/80">
          {/* Color picker */}
          {activeTool !== 'eraser' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-text-muted">Color</span>
                <span className="text-xs font-mono text-text-muted">{currentColor}</span>
              </div>
              <ColorPicker
                currentColor={currentColor}
                onColorChange={handleColorChange}
              />
            </div>
          )}

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

          {/* Opacity slider for highlighter */}
          {activeTool === 'highlighter' && (
            <div>
              <Slider
                value={opacity}
                onChange={handleOpacityChange}
                min={0.1}
                max={0.5}
                step={0.1}
                label="Opacity"
                preview={
                  <div 
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: `${currentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` }}
                  />
                }
              />
            </div>
          )}

          {/* Document actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClear}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg 
                bg-surface border border-border/80
                hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400
                active:scale-95 transition-all duration-200"
            >
              <ClearIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Clear Page</span>
            </button>
            <button
              onClick={onSave}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                bg-surface border border-border/80
                hover:bg-primary/10 hover:text-primary
                active:scale-95 transition-all duration-200"
            >
              <SaveIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}