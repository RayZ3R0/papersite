'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ColorPreset, colorPresets } from './types';
import Tooltip from './components/Tooltip';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempColor, setTempColor] = useState(currentColor);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePresetClick = (color: string) => {
    onColorChange(color);
    setTempColor(color);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTempColor(color);
  };

  const handleCustomInputBlur = () => {
    if (tempColor !== currentColor) {
      onColorChange(tempColor);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onColorChange(tempColor);
      inputRef.current?.blur();
    }
  };

  const getContrastText = useCallback((bgColor: string): string => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }, []);

  return (
    <div className="space-y-3">
      {/* Color presets */}
      <div className="grid grid-cols-6 gap-1.5">
        {colorPresets.map((preset) => (
          <Tooltip key={preset.color} content={preset.name}>
            <button
              onClick={() => handlePresetClick(preset.color)}
              className={`w-8 h-8 rounded-lg transition-all duration-200 
                ${currentColor === preset.color 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'hover:scale-110 hover:shadow-lg'}`}
              style={{ 
                backgroundColor: preset.color,
                color: getContrastText(preset.color)
              }}
              aria-label={`Select ${preset.name} color`}
            >
              {currentColor === preset.color && (
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="mx-auto"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Custom color input */}
      <div>
        <Tooltip content="Click to enter custom color">
          <button
            onClick={() => {
              setShowCustomPicker(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className={`flex items-center gap-2 w-full p-2 rounded-lg 
              transition-all duration-200 hover:bg-surface-alt group
              ${showCustomPicker ? 'bg-surface-alt' : ''}`}
          >
            <div 
              className="w-6 h-6 rounded border border-border/80 shadow-sm"
              style={{ backgroundColor: currentColor }}
            />
            {showCustomPicker ? (
              <input
                ref={inputRef}
                type="text"
                value={tempColor}
                onChange={handleCustomInputChange}
                onBlur={handleCustomInputBlur}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none 
                  text-xs font-mono focus:ring-0 p-0"
                placeholder="#000000"
              />
            ) : (
              <span className="text-xs font-mono text-text-muted group-hover:text-text">
                {currentColor}
              </span>
            )}
          </button>
        </Tooltip>
      </div>
      
      {/* Color input */}
      <div className="relative">
        <input
          type="color"
          value={tempColor}
          onChange={(e) => {
            setTempColor(e.target.value);
            onColorChange(e.target.value);
          }}
          className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
          aria-label="Choose custom color"
        />
        <div 
          className="h-8 rounded-lg border border-border/80 cursor-pointer
            bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)]"
        />
      </div>
    </div>
  );
}