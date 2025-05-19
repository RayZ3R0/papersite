import { useState } from "react";

interface PDFControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  scale: number;
  maxScale?: number;
  minScale?: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  showShortcuts: boolean;
  onToggleShortcuts: () => void;
}

export default function PDFControls({
  onZoomIn,
  onZoomOut,
  onRotateClockwise,
  onRotateCounterClockwise,
  scale,
  maxScale = 5,
  minScale = 0.5,
  rotation,
  currentPage,
  totalPages,
  onPageChange,
  showShortcuts = false,
  onToggleShortcuts
}: PDFControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-surface-alt rounded-lg mb-2">
      <button
        onClick={onZoomOut}
        disabled={scale <= minScale}
        className="p-1.5 rounded-md hover:bg-surface-hover disabled:opacity-50"
        title="Zoom Out"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <span className="text-sm font-medium min-w-[4rem] text-center">
        {Math.round(scale * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        disabled={scale >= maxScale}
        className="p-1.5 rounded-md hover:bg-surface-hover disabled:opacity-50"
        title="Zoom In"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Help Button */}
      <button
        onClick={onToggleShortcuts}
        className={`p-1.5 rounded-md hover:bg-surface-hover ${showShortcuts ? 'text-primary' : ''}`}
        title="Keyboard Shortcuts"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-surface-hover disabled:opacity-50"
          title="Previous Page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm font-medium min-w-[4rem] text-center">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md hover:bg-surface-hover disabled:opacity-50"
          title="Next Page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <button
        onClick={onRotateCounterClockwise}
        className="p-1.5 rounded-md hover:bg-surface-hover"
        title="Rotate Counterclockwise"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button
        onClick={onRotateClockwise}
        className="p-1.5 rounded-md hover:bg-surface-hover"
        title="Rotate Clockwise"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
        </svg>
      </button>
    </div>
  );
}