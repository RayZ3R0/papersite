"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { debounce } from "@/lib/utils/debounce";

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

  // Initialize or update player when API is ready and track/play state changes
  useEffect(() => {
    if (!isAPIReady || !currentTrack || !document.getElementById(PLAYER_ID)) return;

    const initializePlayer = () => {
      // Mark that we're initializing to prevent unwanted state changes
      let isInitializing = true;

      playerRef.current = new window.YT.Player(PLAYER_ID, {
        videoId: currentTrack.id,
        playerVars: {
          autoplay: 0, // Start paused and control playback after initialization
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: async (event: { target: any }) => {
            try {
              // Set initial volume
              event.target.setVolume(volume * 100);
              
              // Wait for video to be cued
              await new Promise<void>((resolve) => {
                const checkState = (e: { data: number }) => {
                  // YT.PlayerState.CUED = 5
                  if (e.data === 5) {
                    event.target.removeEventListener('onStateChange', checkState);
                    resolve();
                  }
                };
                event.target.addEventListener('onStateChange', checkState);
                // Force cue the video
                event.target.cueVideoById(currentTrack.id);
              });

              // Apply play state once video is ready
              if (isPlaying) {
                await event.target.playVideo();
              }
              
              isInitializing = false;
            } catch (error) {
              console.error('Failed to initialize player:', error);
              handleError();
            }
          },
          onStateChange: (event: { data: number }) => {
            if (isInitializing) return; // Ignore state changes during initialization
            
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              nextTrack();
            }
            // YT.PlayerState.PAUSED = 2
            else if (event.data === 2) {
              // Only pause if we're not in the middle of a track change
              if (!playerRef.current?.isChangingTrack) {
                pauseTrack();
              }
            }
          },
          onError: () => {
            handleError();
          }
        }
      });
    };

    const updatePlayer = async () => {
      try {
        if (playerRef.current) {
          // Mark that we're changing tracks to prevent unwanted pause triggers
          playerRef.current.isChangingTrack = true;
          
          // Load the new video and wait for it to be ready
          await new Promise((resolve, reject) => {
            try {
              playerRef.current.loadVideoById({
                videoId: currentTrack.id,
                startSeconds: 0
              });
              
              // Use onStateChange to detect when video is ready
              const stateChangeHandler = (event: { data: number }) => {
                // YT.PlayerState.CUED = 5
                if (event.data === 5) {
                  playerRef.current.removeEventListener('onStateChange', stateChangeHandler);
                  resolve(true);
                }
              };
              
              playerRef.current.addEventListener('onStateChange', stateChangeHandler);
            } catch (error) {
              reject(error);
            }
          });

          // Now that video is ready, apply the play state
          if (isPlaying) {
            await playerRef.current.playVideo();
          } else {
            await playerRef.current.pauseVideo();
          }

          // Clear track change flag after state is fully applied
          playerRef.current.isChangingTrack = false;
        } else {
          initializePlayer();
        }
      } catch (e) {
        console.error('Failed to update YouTube player:', e);
        // Clear flag in case of error
        if (playerRef.current?.isChangingTrack) {
          playerRef.current.isChangingTrack = false;
        }
        handleError();
      }
    };

    updatePlayer();
  }, [isAPIReady, currentTrack, isPlaying, volume]);

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

  // Enhanced error handler with state cleanup
  const handleError = useCallback(
    debounce(() => {
      console.log('Handling player error, switching to next track...');
      if (playerRef.current?.isChangingTrack) {
        playerRef.current.isChangingTrack = false;
      }
      nextTrack();
    }, 1000, { leading: true, trailing: false }),
    [nextTrack]
  );

  return (
    <div ref={containerRef} className="w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div id={PLAYER_ID} />
    </div>
  );
}