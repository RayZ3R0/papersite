import React, { useRef, useState, useCallback } from 'react';
import type { TooltipProps } from './Tooltip';
import { Tooltip } from './index';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  preview?: React.ReactNode;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  preview
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Calculate percentage for positioning
  const getPercentage = useCallback((value: number) => {
    return ((value - min) / (max - min)) * 100;
  }, [min, max]);

  // Calculate value from percentage
  const getValueFromPercent = useCallback((percent: number) => {
    const rawValue = (percent * (max - min)) / 100 + min;
    const steps = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, Number(steps.toFixed(2))));
  }, [min, max, step]);

  // Update value based on pointer position
  const updateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercent(percent);
    
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, onChange, getValueFromPercent]);

  // Handle pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!thumbRef.current) return;

    setIsDragging(true);
    setShowTooltip(true);
    thumbRef.current.setPointerCapture(e.pointerId);
    updateValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateValue(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!thumbRef.current) return;

    setIsDragging(false);
    setShowTooltip(false);
    thumbRef.current.releasePointerCapture(e.pointerId);
  };

  // Handle track clicks
  const handleTrackClick = (e: React.MouseEvent) => {
    // Ignore if clicking on thumb
    if (e.target === thumbRef.current) return;
    updateValue(e.clientX);
  };

  const percentage = getPercentage(value);

  return (
    <div className="space-y-2">
      {/* Label and preview */}
      {(label || preview) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {label}
            </span>
          )}
          {preview}
        </div>
      )}

      {/* Slider track and thumb */}
      <div className="relative h-9 flex items-center touch-none">
        {/* Track background */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="absolute h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 cursor-pointer"
        >
          {/* Active track */}
          <div
            className="absolute h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-100"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb */}
        <Tooltip content={value.toString()} position="top" delay={0}>
          <div
            ref={thumbRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`absolute w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 
              border-2 border-white dark:border-gray-900
              shadow-md cursor-grab transition-transform duration-100 
              hover:scale-110 focus:scale-110 focus:outline-none
              ${isDragging ? 'scale-110 cursor-grabbing shadow-lg' : ''}`}
            style={{
              left: `calc(${percentage}% - 0.5rem)`,
              transform: `translateY(-50%) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
              touchAction: 'none'
            }}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            tabIndex={0}
          />
        </Tooltip>

        {/* Value label */}
        <div 
          className={`absolute right-0 -top-6 text-xs font-mono 
            text-gray-500 dark:text-gray-400
            transition-opacity duration-200
            ${showTooltip ? 'opacity-0' : 'opacity-100'}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}