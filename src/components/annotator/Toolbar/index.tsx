'use client';

import { useState } from 'react';
import ColorPicker from './ColorPicker';

export type ToolType = 'pen' | 'highlighter' | 'eraser';

interface ToolbarProps {
  onToolChange?: (tool: ToolType) => void;
  onColorChange?: (color: string) => void;
  onSizeChange?: (size: number) => void;
}

export default function Toolbar({
  onToolChange,
  onColorChange,
  onSizeChange
}: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    onToolChange?.(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onColorChange?.(color);
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-surface rounded-lg shadow-lg 
      border border-border p-2 flex flex-col gap-2"
    >
      {/* Tools */}
      <div className="flex gap-1">
        <button
          onClick={() => handleToolChange('pen')}
          className={`p-2 rounded-lg transition-colors ${
            activeTool === 'pen' ? 'bg-primary text-white' : 'hover:bg-surface-alt'
          }`}
          title="Pen Tool"
        >
          ✏️
        </button>
        <button
          onClick={() => handleToolChange('highlighter')}
          className={`p-2 rounded-lg transition-colors ${
            activeTool === 'highlighter' ? 'bg-primary text-white' : 'hover:bg-surface-alt'
          }`}
          title="Highlighter"
        >
          🖍️
        </button>
        <button
          onClick={() => handleToolChange('eraser')}
          className={`p-2 rounded-lg transition-colors ${
            activeTool === 'eraser' ? 'bg-primary text-white' : 'hover:bg-surface-alt'
          }`}
          title="Eraser"
        >
          ⌫
        </button>
      </div>

      {/* Color Picker */}
      <ColorPicker
        currentColor={currentColor}
        onColorChange={handleColorChange}
      />

      {/* Size Slider - Only show for pen/highlighter */}
      {activeTool !== 'eraser' && (
        <input
          type="range"
          min="1"
          max="20"
          defaultValue="5"
          className="w-full"
          onChange={(e) => onSizeChange?.(Number(e.target.value))}
        />
      )}
    </div>
  );
}