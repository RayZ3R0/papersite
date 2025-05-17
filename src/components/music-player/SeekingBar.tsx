"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function SeekingBar() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  
  const {
    currentTrack,
    currentTime,
    seekTo
  } = useMusicPlayer();

  const duration = currentTrack?.duration || 0;
  const progress = (currentTime / duration) * 100;

  const handleSeek = useCallback((clientX: number) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = (clientX - rect.left) / rect.width;
    const seekTime = Math.max(0, Math.min(position * duration, duration));
    seekTo(seekTime);
  }, [duration, seekTo]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleSeek(e.clientX);
    }

    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = (e.clientX - rect.left) / rect.width;
    setHoverPosition(Math.max(0, Math.min(position * duration, duration)));
  }, [isDragging, duration, handleSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="px-4 py-2">
      <div 
        ref={progressRef}
        className="group relative h-1 rounded-full bg-surface-alt/50 cursor-pointer
          hover:h-2 transition-all duration-150 ease-spring overflow-hidden"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          handleSeek(e.clientX);
        }}
        onMouseEnter={(e) => {
          const rect = progressRef.current?.getBoundingClientRect();
          if (!rect) return;
          const position = (e.clientX - rect.left) / rect.width;
          setHoverPosition(Math.max(0, Math.min(position * duration, duration)));
        }}
        onMouseMove={(e) => {
          if (!isDragging) {
            const rect = progressRef.current?.getBoundingClientRect();
            if (!rect) return;
            const position = (e.clientX - rect.left) / rect.width;
            setHoverPosition(Math.max(0, Math.min(position * duration, duration)));
          }
        }}
        onMouseLeave={() => setHoverPosition(null)}
      >
        {/* Progress Fill */}
        <div 
          className="absolute inset-0 bg-primary origin-left transition-transform duration-150"
          style={{ transform: `scaleX(${progress / 100})` }}
        />

        {/* Hover Indicator */}
        {hoverPosition !== null && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-glow
              transform transition-transform duration-75 pointer-events-none"
            style={{ 
              left: `${(hoverPosition / duration) * 100}%`,
              transform: `translateX(-50%) scaleY(${isDragging ? 1.5 : 1})`
            }}
          />
        )}
        
        {/* Progress Handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white 
            shadow-md transform -translate-x-1/2 transition-all duration-150
            opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100"
          style={{ 
            left: `${progress}%`,
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.2 : 1})`
          }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Styles for glow effect */}
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5),
                      0 0 20px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}