'use client';

import { useState } from 'react';

const DEFAULT_COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#FF0080', // Pink
];

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  currentColor: string;
}

export default function ColorPicker({ onColorChange, currentColor }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-lg border border-border overflow-hidden 
          hover:shadow-md transition-shadow"
        style={{ backgroundColor: currentColor }}
        aria-label="Select Color"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-surface 
          border border-border rounded-lg shadow-lg z-50
          grid grid-cols-5 gap-2"
        >
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                onColorChange(color);
                setIsOpen(false);
              }}
              className={`w-6 h-6 rounded transition-transform
                ${currentColor === color ? 'scale-110 shadow-md' : 'hover:scale-105'}
                border border-border/50`}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color} color`}
            />
          ))}

          {/* Custom color input */}
          <div className="col-span-5 mt-2 pt-2 border-t border-border">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}