'use client';

import React from 'react';
import { ToolType } from '../types';
import Tooltip from './Tooltip';

interface ToolButtonProps {
  tool: ToolType;
  activeTool: ToolType;
  onClick: (tool: ToolType) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const toolIcons = {
  pen: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  highlighter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15.5 4.5l4 4m-12 12v-4l10-10 4 4-10 10h-4" />
    </svg>
  ),
  eraser: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 20H7L3 16c-.8-.8-.8-2.2 0-3l10.7-10.7c.8-.8 2.2-.8 3 0l4 4c.8.8.8 2.2 0 3L10 20" />
    </svg>
  )
};

const toolLabels = {
  pen: 'Pen',
  highlighter: 'Highlighter',
  eraser: 'Eraser'
};

const toolTooltips = {
  pen: 'Draw with pen (P)',
  highlighter: 'Highlight text (H)',
  eraser: 'Erase annotations (E)'
};

export default function ToolButton({
  tool,
  activeTool,
  onClick,
  size = 'md',
  showLabel = false
}: ToolButtonProps) {
  const isActive = tool === activeTool;

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: showLabel ? 'px-3 py-2.5' : 'p-3'
  };

  return (
    <Tooltip content={toolTooltips[tool]}>
      <button
        onClick={() => onClick(tool)}
        className={`group relative rounded-lg transition-all duration-200
          ${sizeClasses[size]}
          ${isActive 
            ? 'bg-primary/10 text-primary shadow-sm' 
            : 'hover:bg-surface-alt hover:text-text active:bg-surface-alt/80'}
          ${showLabel ? 'w-full' : 'aspect-square'}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
        aria-label={toolLabels[tool]}
        aria-pressed={isActive}
      >
        {/* Button content with ripple effect */}
        <div className="relative flex items-center justify-center gap-2">
          {/* Icon */}
          <div className={`flex-shrink-0 transition-transform duration-200
            ${isActive ? 'scale-110' : 'group-hover:scale-105 group-active:scale-95'}`}
          >
            {toolIcons[tool]}
          </div>

          {/* Label */}
          {showLabel && (
            <span className="text-xs font-medium">{toolLabels[tool]}</span>
          )}

          {/* Active indicator */}
          <div className={`absolute -inset-1 rounded-lg transition-all duration-300
            ${isActive 
              ? 'bg-primary/5 border border-primary/10 opacity-100' 
              : 'opacity-0 border-transparent'}
          `} />
        </div>

        {/* Focus ring */}
        <div className={`absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none
          ${isActive ? 'ring-2 ring-primary/30' : 'ring-0'}`}
        />

        {/* Hover background */}
        <div className={`absolute inset-0 rounded-lg bg-current transition-opacity duration-200
          ${isActive ? 'opacity-[0.03]' : 'opacity-0 group-hover:opacity-[0.02]'}`}
        />
      </button>
    </Tooltip>
  );
}