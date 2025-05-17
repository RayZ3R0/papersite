"use client";

import React from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import PlayerControls from "./PlayerControls";
import SeekingBar from "./SeekingBar";

export default function ExpandedPlayer() {
  const { currentTrack, isPlaying, toggleMinimize } = useMusicPlayer();

  return (
    <div className="w-80 bg-surface border border-border rounded-lg 
      shadow-lg overflow-hidden music-player-fade-in hover:shadow-xl
      transition-all duration-300 ease-spring">
      {/* Header */}
      <div 
        onClick={toggleMinimize}
        className="flex items-center justify-between p-4 border-b border-border
          cursor-pointer hover:bg-surface-alt transition-all duration-300 group
          hover:border-primary/30"
      >
        <h3 className="text-sm font-medium group-hover:text-primary transition-colors duration-300 flex items-center">
          Music Player
          <span className="text-xs text-text-muted ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            (click to minimize)
          </span>
        </h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleMinimize();
          }}
          className="text-text-muted hover:text-primary rounded-full p-1 
            hover:bg-surface transition-all duration-300 hover:rotate-90
            hover:scale-110 active:scale-95"
          aria-label="Minimize player"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Track Info */}
      <div className="p-6 text-center">
        {currentTrack ? (
          <>
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-surface-alt 
              flex items-center justify-center relative overflow-hidden
              border-4 border-border hover:scale-105 transition-transform duration-300
              hover:border-primary/30 group">
              {/* Spinning Animation for Active Playback */}
              <div className={`absolute inset-0 transition-all duration-500
                ${isPlaying ? 'animate-spin-slow opacity-100' : 'opacity-0'}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full text-primary/10">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.5 }} />
                    </linearGradient>
                  </defs>
                  <path d="M50 0 A50 50 0 0 1 100 50 A50 50 0 0 1 50 100 A50 50 0 0 1 0 50 A50 50 0 0 1 50 0 Z" 
                    fill="url(#gradient)" />
                </svg>
              </div>
              
              {/* Music Note Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                className={`w-12 h-12 text-primary relative z-10 transition-all duration-300
                  ${isPlaying ? 'animate-bounce-subtle scale-110' : 'scale-100'}
                  group-hover:scale-125`}
                fill="currentColor"
              >
                <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
              </svg>
            </div>
            
            <h2 className="text-lg font-semibold mb-1 hover:text-primary transition-colors duration-300">
              {currentTrack.title}
            </h2>
            <p className="text-text-muted text-sm transition-colors duration-300
              hover:text-text">
              {currentTrack.artist}
            </p>
          </>
        ) : (
          <div className="text-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-4 opacity-50" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p>No track selected</p>
          </div>
        )}
      </div>

      {/* Seeking Bar */}
      <div className="border-t border-border">
        <SeekingBar />
      </div>

      {/* Player Controls */}
      <PlayerControls />

      {/* Add global styles */}
      <style jsx global>{`
        .music-player-fade-in {
          animation: playerFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes playerFadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}