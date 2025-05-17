"use client";

import React from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";

export default function MinimizedPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    toggleMinimize, 
    playTrack, 
    pauseTrack 
  } = useMusicPlayer();

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  };

  return (
    <div className="group">
      <button
        onClick={toggleMinimize}
        className="w-12 h-12 rounded-full bg-surface border border-border
          hover:scale-110 hover:shadow-lg transition-all duration-300 ease-spring
          hover:-translate-y-1 flex items-center justify-center relative
          hover:border-primary/30 active:scale-95"
        aria-label="Expand music player"
      >
        {/* Pulse animation for active playback */}
        {isPlaying && (
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow" />
        )}

        {/* Play/Pause Icon */}
        <div 
          onClick={handlePlayPause}
          className="relative z-10 text-text group-hover:text-primary 
            transition-all duration-300 hover:scale-110 active:scale-90"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
              className="w-6 h-6 transition-transform duration-300 hover:scale-110"
              fill="currentColor">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
              className="w-6 h-6 transition-transform duration-300 hover:scale-110"
              fill="currentColor">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Music note animation when playing */}
        {isPlaying && (
          <div className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-music-note">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className="transition-transform duration-300 hover:scale-110">
              <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
            </svg>
          </div>
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2
        opacity-0 group-hover:opacity-100 transition-all duration-300
        pointer-events-none min-w-[160px] transform group-hover:-translate-y-1">
        <div className="bg-surface border border-border rounded-lg py-1.5 px-3
          text-sm text-text shadow-lg transition-all duration-300
          group-hover:border-primary/30">
          <p className="font-medium whitespace-nowrap">
            {currentTrack ? currentTrack.title : "Music Player"}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {isPlaying ? "Now Playing" : "Click to expand"}
          </p>
        </div>
      </div>

      {/* Add animations */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        @keyframes music-note {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          50% { transform: translate(-5px, -10px) rotate(-10deg); opacity: 0.6; }
          100% { transform: translate(-10px, -20px) rotate(-20deg); opacity: 0; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-music-note {
          animation: music-note 2s ease-out infinite;
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}