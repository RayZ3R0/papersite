"use client";

import React, { useEffect } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { MusicPlayerProvider } from "./MusicPlayerProvider";
import MinimizedPlayer from "./MinimizedPlayer";
import ExpandedPlayer from "./ExpandedPlayer";
import YouTubePlayer from "./YouTubePlayer";
import { tracks } from "./trackList";

// Check if the client is using a mobile browser
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

function MusicPlayer() {
  const { isMinimized, playTrack, pauseTrack } = useMusicPlayer();

  // Start with the first track on mount (but don't autoplay)
  useEffect(() => {
    try {
      // Initialize with first track but don't autoplay
      playTrack(tracks[0]);
      pauseTrack();
    } catch (e) {
      console.error('Failed to set initial track:', e);
    }
  }, []);

  // Don't render on mobile devices
  if (isMobileDevice()) {
    return null;
  }

  return (
    <>
      {/* Player UI with animations */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <div className={`
          transition-all duration-500 ease-spring
          ${isMinimized ? 'scale-100 rotate-0' : 'scale-0 rotate-90 pointer-events-none opacity-0'}
        `}>
          <MinimizedPlayer />
        </div>
        <div className={`
          transition-all duration-500 ease-spring
          ${isMinimized ? 'scale-0 rotate-90 pointer-events-none opacity-0' : 'scale-100 rotate-0'}
          origin-bottom-right absolute bottom-0 right-0
        `}>
          <ExpandedPlayer />
        </div>
      </div>
      
      {/* YouTube Player - Always mounted to prevent reinit issues */}
      <YouTubePlayer />

      {/* Add global styles */}
      <style jsx global>{`
        @keyframes expandPlayer {
          from {
            transform: scale(0.5) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes minimizePlayer {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(0.5) translateY(20px);
            opacity: 0;
          }
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}

// Wrap the player with its provider
export function MusicPlayerWithProvider() {
  // Don't initialize on mobile devices
  if (isMobileDevice()) {
    return null;
  }

  return (
    <MusicPlayerProvider>
      <MusicPlayer />
    </MusicPlayerProvider>
  );
}