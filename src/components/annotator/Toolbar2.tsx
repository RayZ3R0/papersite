import React from 'react';
import type { ToolType } from '@/types/annotator';

interface ToolbarProps {
  currentTool: ToolType;
  currentColor: string;
  currentSize: number;
  currentOpacity: number;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
}

const colors = [
  '#000000', // Black 
  '#4b5563', // Gray
  '#ef4444', // Red
  '#f97316', // Orange
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
];

export default function Toolbar({
  currentTool,
  currentColor,
  currentSize,
  currentOpacity,
  onToolChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave
}: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex flex-wrap items-center gap-4">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
          <button
            onClick={() => onToolChange('pen')}
            className={`p-2 rounded-md ${currentTool === 'pen' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100 text-gray-700'}`}
            title="Pen"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
            </svg>
          </button>
          
          <button
            onClick={() => onToolChange('highlighter')}
            className={`p-2 rounded-md ${currentTool === 'highlighter' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100 text-gray-700'}`}
            title="Highlighter"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11.5h6M9 15h6M19.707 6.707c.39.39.39 1.024 0 1.414L12 16H8v-4l8.293-8.293c.39-.39 1.024-.39 1.414 0l2 2zM14 4l2 2M10 8l2 2M6 12l2 2" />
            </svg>
          </button>
          
          <button
            onClick={() => onToolChange('eraser')}
            className={`p-2 rounded-md ${currentTool === 'eraser' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100 text-gray-700'}`}
            title="Eraser"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m16 14-7 7M7.5 9.5l9 9M20 9l-5 5M6 15l3-3M14 7l3-3" />
            </svg>
          </button>
        </div>
        
        {/* Color Selection */}
        {(currentTool === 'pen' || currentTool === 'highlighter') && (
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
            <span className="text-sm text-gray-500 mr-1">Color:</span>
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-6 h-6 rounded-full border ${
                  currentColor === color ? 'ring-2 ring-primary' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
        
        {/* Size Controls */}
        <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
          <span className="text-sm text-gray-500">Size:</span>
          <input
            type="range"
            min="1"
            max={currentTool === 'eraser' ? "40" : currentTool === 'highlighter' ? "20" : "10"}
            value={currentSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-700">{currentSize}px</span>
        </div>
        
        {/* Opacity (for highlighter) */}
        {currentTool === 'highlighter' && (
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <span className="text-sm text-gray-500">Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={currentOpacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-700">{Math.round(currentOpacity * 100)}%</span>
          </div>
        )}
        
        {/* Edit Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-md ${
              canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a5 5 0 0 1 5 5v2m0-12 4 4-4 4" />
            </svg>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-md ${
              canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H11a5 5 0 0 0-5 5v2m0-12-4 4 4 4" />
            </svg>
          </button>
          
          <button
            onClick={onClear}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            title="Clear Page"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
            </svg>
          </button>
          
          <button
            onClick={onSave}
            className="ml-2 px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90"
            title="Save PDF"
          >
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Save PDF</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}