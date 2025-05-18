"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { throttle } from "../../lib/utils/throttle";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface SeekPreviewTooltipProps {
  time: number;
  position: { x: number; y: number };
}

const SeekPreviewTooltip = ({ time, position }: SeekPreviewTooltipProps) => (
  <div
    className="absolute bottom-full mb-2 px-2 py-1 bg-surface border border-border
      rounded text-xs font-medium shadow-lg transform -translate-x-1/2 pointer-events-none"
    style={{ left: position.x }}
  >
    {formatTime(time)}
  </div>
);

export default function SeekingBar() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>();
  
  const {
    currentTrack,
    currentTime,
    seekTo,
    isBuffering
  } = useMusicPlayer();

  const duration = currentTrack?.duration || 0;
  const progress = (currentTime / duration) * 100;

  // Throttled seek function to prevent excessive updates
  const throttledSeek = useCallback(
    throttle((time: number) => seekTo(time), 16),
    [seekTo]
  );

  const calculateSeekTime = useCallback((clientX: number) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(position * duration, duration));
  }, [duration]);

  const handleSeek = useCallback((clientX: number) => {
    const seekTime = calculateSeekTime(clientX);
    if (seekTime !== null) {
      throttledSeek(seekTime);
    }
  }, [calculateSeekTime, throttledSeek]);

  const updateHoverPosition = useCallback((clientX: number) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const time = calculateSeekTime(clientX);
    if (time !== null) {
      setHoverPosition(time);
      setTooltipPosition({ x: clientX - rect.left, y: rect.top });
    }
  }, [calculateSeekTime]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleSeek(e.clientX);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      updateHoverPosition(e.clientX);
    });
  }, [isDragging, handleSeek, updateHoverPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const STEP = 5; // 5 seconds
    let newTime = currentTime;

    switch (e.key) {
      case "ArrowRight":
        newTime = Math.min(currentTime + STEP, duration);
        break;
      case "ArrowLeft":
        newTime = Math.max(currentTime - STEP, 0);
        break;
      case "Home":
        newTime = 0;
        break;
      case "End":
        newTime = duration;
        break;
      default:
        return;
    }

    e.preventDefault();
    seekTo(newTime);
  }, [currentTime, duration, seekTo]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="px-4 py-3">
      <div
        ref={progressRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek track position"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        className={`group relative h-1.5 rounded-full bg-surface-alt cursor-pointer
          hover:h-3 [transition:height_300ms,transform_300ms,background_300ms]
          ease-spring-bounce overflow-hidden hover:bg-surface-alt/70
          hover:shadow-md shadow-sm ${isBuffering ? 'animate-pulse' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          handleSeek(e.clientX);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          setIsDragging(true);
          handleSeek(touch.clientX);
        }}
        onTouchMove={(e) => {
          if (isDragging) {
            const touch = e.touches[0];
            handleSeek(touch.clientX);
          }
        }}
        onTouchEnd={() => {
          setIsDragging(false);
        }}
        onMouseEnter={(e) => updateHoverPosition(e.clientX)}
        onMouseMove={(e) => {
          if (!isDragging) {
            updateHoverPosition(e.clientX);
          }
        }}
        onMouseLeave={() => {
          setHoverPosition(null);
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Loading Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 bg-primary/30 animate-pulse" />
        )}

        {/* Progress Fill */}
        <div
          className="absolute inset-0 bg-primary origin-left transition-transform
            duration-150 group-hover:duration-300"
          style={{ transform: `scaleX(${progress / 100})` }}
        />

        {/* Hover Indicator and Tooltip */}
        {hoverPosition !== null && (
          <>
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary shadow-glow
                transform transition-all duration-300 pointer-events-none
                rounded-full opacity-75 group-hover:opacity-100"
              style={{
                left: `${(hoverPosition / duration) * 100}%`,
                transform: `translateX(-50%) scaleY(${isDragging ? 1.5 : 1})`
              }}
            />
            <SeekPreviewTooltip
              time={hoverPosition}
              position={tooltipPosition}
            />
          </>
        )}
        
        {/* Progress Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary
            shadow-lg transform -translate-x-1/2 transition-all duration-300
            opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100
            border-2 border-background hover:scale-110 hover:shadow-xl
            focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            left: `${progress}%`,
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.2 : 1})`
          }}
          role="presentation"
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between mt-1.5 text-xs font-medium text-text-muted">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Styles for animations and effects */}
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 10px var(--color-primary),
                      0 0 15px var(--color-primary-light);
        }

        .ease-spring-bounce {
          transition-timing-function: cubic-bezier(0.4, 2.08, 0.55, 0.9);
        }

        @keyframes progress-pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}