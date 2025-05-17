"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { Track } from "./types";

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
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentTrackRef = useRef<Track | null>(null);
  
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
    if (isLoading) return; // Prevent changes while loading
    if (currentTrackRef.current?.id === currentTrack.id) return; // Prevent duplicate loads

    setIsLoading(true);
    currentTrackRef.current = currentTrack;

    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Set a loading timeout to prevent rapid changes
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    if (playerRef.current) {
      try {
        // Always use loadVideoById, but configure it properly for live streams
        playerRef.current.loadVideoById({
          videoId: currentTrack.id,
          startSeconds: undefined,
          endSeconds: undefined,
          suggestedQuality: currentTrack.duration === 0 ? 'medium' : 'default'
        });
      } catch (e) {
        console.error('Failed to update YouTube player:', e);
        setIsLoading(false);
      }
    } else {
      try {
        playerRef.current = new window.YT.Player(PLAYER_ID, {
          videoId: currentTrack.id,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: currentTrack.duration === 0 ? 1 : 0, // Enable controls for live streams
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
              // YT.PlayerState
              // UNSTARTED = -1
              // ENDED = 0
              // PLAYING = 1
              // PAUSED = 2
              // BUFFERING = 3
              // CUED = 5
              
              switch (event.data) {
                case -1: // UNSTARTED
                  if (currentTrack?.duration === 0 && isPlaying) {
                    // For live streams, try to play when ready
                    playerRef.current?.playVideo();
                  }
                  break;
                case 0: // ENDED
                  if (currentTrack?.duration !== 0) {
                    // Only auto-advance for non-live videos
                    nextTrack();
                  }
                  break;
                case 1: // PLAYING
                  setIsLoading(false);
                  break;
                case 2: // PAUSED
                  pauseTrack();
                  break;
                case 3: // BUFFERING
                  // Keep loading state while buffering
                  setIsLoading(true);
                  break;
                case 5: // CUED
                  if (currentTrack?.duration === 0 && isPlaying) {
                    // For live streams, try to play when cued
                    playerRef.current?.playVideo();
                  }
                  break;
              }
            },
            onError: (error: { data: number }) => {
              console.error('YouTube player error:', error);
              setIsLoading(false);
              // Only skip to next track for fatal errors
              if (error.data === 5 || error.data === 100 || error.data === 101 || error.data === 150) {
                nextTrack();
              }
            }
          }
        });
      } catch (e) {
        console.error('Failed to initialize YouTube player:', e);
      }
    }
  }, [isAPIReady, currentTrack]);

  // Update player state - only handle pause since we always play on track change
  useEffect(() => {
    if (!playerRef.current || isLoading) return;

    try {
      if (!isPlaying) {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error('Failed to update player state:', e);
    }
  }, [isPlaying, isLoading]);

  // Cleanup loading timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

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