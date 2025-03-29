'use client';

import { useState, useRef } from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const DEFAULT_COLORS = [
  '#000000', // Black
  '#404040', // Dark Gray
  '#7A7A7A', // Gray
  '#FF4136', // Red
  '#FF851B', // Orange
  '#FFDC00', // Yellow
  '#2ECC40', // Green
  '#0074D9', // Blue
  '#B10DC9', // Purple
  '#F012BE', // Magenta
];

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  currentColor: string;
}

export default function ColorPicker({ onColorChange, currentColor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside
  useOnClickOutside(pickerRef, () => setIsOpen(false));
  
  // Ensure good color contrast for the selected color indicator
  const isDark = (color: string) => {
    // Convert hex to RGB
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };
  
  return (
    <div ref={pickerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-border/80 hover:border-border
          hover:shadow-sm transition-all bg-background w-full"
        aria-label="Select Color"
      >
        <div className="flex-shrink-0 w-6 h-6 rounded-md overflow-hidden shadow-sm border border-border/30 hover:scale-105 transition-transform"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1 text-left overflow-hidden">
          <span className={`text-xs font-mono uppercase ${isDark(currentColor) ? 'text-white' : 'text-black'}`}
            style={{ backgroundColor: currentColor }}>
            {currentColor}
          </span>
        </div>
        <svg className="w-3.5 h-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <polyline points="18 15 12 9 6 15"></polyline>
          ) : (
            <polyline points="6 9 12 15 18 9"></polyline>
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 p-3 bg-background
          border border-border rounded-xl shadow-lg z-50 w-64 transition-all 
          origin-top-left animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="grid grid-cols-5 gap-2 mb-3">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onColorChange(color);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-md transition-all duration-200
                  ${currentColor.toLowerCase() === color.toLowerCase() 
                    ? 'ring-2 ring-primary ring-offset-1 scale-110 shadow' 
                    : 'hover:scale-105 border border-border/40 hover:shadow-sm'
                  }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="border-t border-border pt-3">
            <div className="text-xs text-text-muted mb-2">Custom Color</div>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => {
                  // Validate hex color format
                  if (e.target.value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                    onColorChange(e.target.value);
                  }
                }}
                onBlur={(e) => {
                  // Make sure we have a valid 6-digit hex on blur
                  if (e.target.value.length < 7) {
                    onColorChange('#000000');
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-surface"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}