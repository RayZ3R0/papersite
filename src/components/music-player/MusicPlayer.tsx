"use client";

import React, { useEffect } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { MusicPlayerProvider } from "./MusicPlayerProvider";
import MinimizedPlayer from "./MinimizedPlayer";
import ExpandedPlayer from "./ExpandedPlayer";
import YouTubePlayer from "./YouTubePlayer";
import { tracks, getRandomTrack } from "./trackList";

// Check if the client is using a mobile browser
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

function MusicPlayer() {
  const { isMinimized, playTrack } = useMusicPlayer();

  // Start with a random track on mount
  useEffect(() => {
    try {
      const randomTrack = getRandomTrack(null);
      // We don't auto-play to avoid unexpected music
      // playTrack(randomTrack);
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
      {/* Player UI */}
      {isMinimized ? <MinimizedPlayer /> : <ExpandedPlayer />}
      
      {/* YouTube Player - Always mounted to prevent reinit issues */}
      <YouTubePlayer />
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