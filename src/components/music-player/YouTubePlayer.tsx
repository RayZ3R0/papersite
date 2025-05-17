"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars: {
            autoplay?: number;
            controls?: number;
            disablekb?: number;
            fs?: number;
            modestbranding?: number;
            playsinline?: number;
            rel?: number;
          };
          events: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => void;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYER_ID = "youtube-music-player";

export default function YouTubePlayer() {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    pauseTrack,
    nextTrack
  } = useMusicPlayer();

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else {
      setIsAPIReady(true);
    }

    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Failed to destroy YouTube player:', e);
        }
        playerRef.current = null;
      }
    };
  }, []);

  // Initialize or update player when API is ready and track changes
  useEffect(() => {
    if (!isAPIReady || !currentTrack || !document.getElementById(PLAYER_ID)) return;

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById(currentTrack.id);
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.error('Failed to update YouTube player:', e);
        nextTrack(); // Skip to next track on error
      }
    } else {
      try {
        playerRef.current = new window.YT.Player(PLAYER_ID, {
          videoId: currentTrack.id,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: (event: { target: any }) => {
              event.target.setVolume(volume * 100);
              if (isPlaying) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: { data: number }) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                nextTrack();
              }
              // YT.PlayerState.PLAYING = 1
              else if (event.data === 1) {
                // Video started playing
              }
              // YT.PlayerState.PAUSED = 2
              else if (event.data === 2) {
                pauseTrack();
              }
            },
            onError: () => {
              nextTrack(); // Skip to next track on error
            }
          }
        });
      } catch (e) {
        console.error('Failed to initialize YouTube player:', e);
      }
    }
  }, [isAPIReady, currentTrack]);

  // Update player state
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error('Failed to update player state:', e);
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
      }
    } catch (e) {
      console.error('Failed to update volume:', e);
    }
  }, [volume, isMuted]);

  return (
    <div ref={containerRef} className="w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div id={PLAYER_ID} />
    </div>
  );
}