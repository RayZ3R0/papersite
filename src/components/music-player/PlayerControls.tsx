"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { debounce } from "../../lib/utils/throttle";

export default function PlayerControls() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    playTrack,
    pauseTrack,
    nextTrack,
    setVolume,
    toggleMute
  } = useMusicPlayer();

  // Volume control state
  const [showVolume, setShowVolume] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Delayed hide function with debounce
  const delayedHideVolume = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    if (!isPinned) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowVolume(false);
        hideTimeoutRef.current = null;
      }, 2000); // 2 second delay before hiding
    }
  }, [isPinned]);

  // Cancel hide when mouse enters volume control
  const cancelHideVolume = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Handle clicks outside volume control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        if (!isPinned) {
          setShowVolume(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clear any pending timeouts on unmount
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPinned]);

  // Save volume preferences
  useEffect(() => {
    try {
      localStorage.setItem('music-player-volume-pinned', isPinned.toString());
    } catch (error) {
      console.error('Failed to save volume pin state:', error);
    }
  }, [isPinned]);

  // Load volume preferences
  useEffect(() => {
    const savedPinned = localStorage.getItem('music-player-volume-pinned');
    if (savedPinned) {
      setIsPinned(savedPinned === 'true');
      setShowVolume(savedPinned === 'true');
    }
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleVolumeButtonClick = () => {
    if (!showVolume) {
      setShowVolume(true);
    }
    toggleMute();
  };

  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3 bg-surface-alt/50 rounded-lg
      transition-all duration-300 hover:bg-surface-alt group">
      {/* Volume Controls - Moved to left */}
      <div
        ref={volumeRef}
        className="relative order-1"
        onMouseEnter={() => {
          cancelHideVolume();
          setShowVolume(true);
        }}
        onMouseLeave={delayedHideVolume}
      >
        <button
          onClick={handleVolumeButtonClick}
          className="p-3 rounded-full hover:bg-surface transition-all duration-300
            hover:scale-110 hover:text-primary hover:shadow-md active:scale-95
            border border-border hover:border-primary relative"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              className="w-5 h-5 transition-transform duration-300"
              fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
            </svg>
          ) : volume < 0.5 ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              className="w-5 h-5 transition-transform duration-300"
              fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM16.5 12a4.5 4.5 0 01-.84 2.61.75.75 0 001.16.95A6 6 0 0018 12c0-1.017-.26-1.975-.72-2.81a.75.75 0 00-1.16.95c.224.391.34.83.34 1.86z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              className="w-5 h-5 transition-transform duration-300"
              fill="currentColor">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
          )}
        </button>

        {/* Volume Slider Popup */}
        <div
          className={`absolute left-0 bottom-full mb-2 transition-all duration-300
            ${showVolume ? 'opacity-100 translate-y-0 pointer-events-auto' :
            'opacity-0 translate-y-2 pointer-events-none'}`}
          onMouseEnter={cancelHideVolume}
          onMouseLeave={delayedHideVolume}
        >
          <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-border rounded-lg appearance-none cursor-pointer
                    transition-all duration-300
                    hover:bg-primary/50
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:duration-300
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-background"
                  aria-label="Volume"
                />
                <button
                  onClick={() => setIsPinned(prev => !prev)}
                  className={`p-1 rounded-full transition-colors duration-300
                    ${isPinned ? 'text-primary bg-surface-alt' : 'text-text-muted hover:text-primary'}`}
                  aria-label={isPinned ? "Unpin volume control" : "Pin volume control"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M10.5 11.5L8.354 9.354a.5.5 0 01.707-.707l2.5 2.5a.5.5 0 010 .707l-2.5 2.5a.5.5 0 01-.707-.707L10.5 11.5z"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-muted">
                  {Math.round(volume * 100)}%
                </span>
                <div className="flex gap-1">
                  {[0.25, 0.5, 0.75, 1].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setVolume(preset)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors duration-300
                        ${volume === preset ? 'bg-primary text-white' :
                        'hover:bg-surface-alt text-text-muted hover:text-primary'}`}
                    >
                      {Math.round(preset * 100)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Play/Pause Button - Centered with larger size */}
      <button
        onClick={handlePlayPause}
        className="order-2 p-3 rounded-full hover:bg-surface transition-all duration-300
          hover:scale-110 hover:text-primary hover:shadow-md active:scale-95
          border border-border hover:border-primary group-hover:rotate-3
          transform scale-110"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            className="w-7 h-7 transition-transform duration-300"
            fill="currentColor">
            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            className="w-7 h-7 transition-transform duration-300"
            fill="currentColor">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Next Track Button - Right side */}
      <button
        onClick={nextTrack}
        className="order-3 p-3 rounded-full hover:bg-surface transition-all duration-300
          hover:scale-110 hover:text-primary hover:shadow-md active:scale-95
          border border-border hover:border-primary group-hover:-rotate-3"
        aria-label="Next track"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          className="w-7 h-7 transition-transform duration-300"
          fill="currentColor">
          <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
        </svg>
      </button>
    </div>
  );
}