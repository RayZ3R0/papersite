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
    currentTime,
    pauseTrack,
    nextTrack,
    updateCurrentTime,
    seekTo
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

  // Save current position periodically
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        const currentTime = playerRef.current.getCurrentTime();
        updateCurrentTime(currentTime);
      } catch (e) {
        console.error('Failed to update current time:', e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, updateCurrentTime]);

  // Initialize or update player when API is ready and track changes
  useEffect(() => {
    if (!isAPIReady || !currentTrack?.id || !document.getElementById(PLAYER_ID)) return;

    const initializePlayer = () => {
      // Mark that we're initializing to prevent unwanted state changes
      let isInitializing = true;

      playerRef.current = new window.YT.Player(PLAYER_ID, {
        videoId: currentTrack.id,
        playerVars: {
          autoplay: 0,
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
              event.target.setVolume(volume * 100);
              
              await new Promise<void>((resolve) => {
                const checkState = (e: { data: number }) => {
                  if (e.data === 5) {
                    event.target.removeEventListener('onStateChange', checkState);
                    resolve();
                  }
                };
                event.target.addEventListener('onStateChange', checkState);
                event.target.cueVideoById(currentTrack.id);
              });

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
            if (isInitializing) return;
            
            if (event.data === 0) {
              nextTrack();
            } else if (event.data === 2 && !playerRef.current?.isChangingTrack) {
              pauseTrack();
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
          const currentVideoId = playerRef.current.getVideoData()?.video_id;
          
          if (currentVideoId !== currentTrack.id) {
            playerRef.current.isChangingTrack = true;
            
            await new Promise((resolve, reject) => {
              try {
                playerRef.current.loadVideoById({
                  videoId: currentTrack.id,
                  startSeconds: currentTime || 0
                });

                const stateChangeHandler = (event: { data: number }) => {
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

            if (isPlaying) {
              await playerRef.current.playVideo();
            } else {
              await playerRef.current.pauseVideo();
            }

            playerRef.current.isChangingTrack = false;
          }
        } else {
          initializePlayer();
        }
      } catch (error) {
        console.error('Failed to update YouTube player:', error);
        if (playerRef.current?.isChangingTrack) {
          playerRef.current.isChangingTrack = false;
        }
        handleError();
      }
    };

    const init = async () => {
      try {
        const currentVideoId = playerRef.current?.getVideoData()?.video_id;
        if (!playerRef.current || currentVideoId !== currentTrack.id) {
          await updatePlayer();
        } else if (isPlaying) {
          await playerRef.current.playVideo();
        } else {
          await playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error('Failed to initialize player:', error);
        handleError();
      }
    };

    init();
  }, [isAPIReady, currentTrack?.id, isPlaying, currentTime, volume]);

  // Handle volume changes separately
  useEffect(() => {
    if (!playerRef.current || playerRef.current.isChangingTrack) return;

    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
      }
    } catch (error) {
      console.error('Failed to update volume:', error);
    }
  }, [volume, isMuted]);

  // Handle seeking
  useEffect(() => {
    if (!playerRef.current || playerRef.current.isChangingTrack || !currentTime) return;

    try {
      const currentPosition = playerRef.current.getCurrentTime();
      if (Math.abs(currentPosition - currentTime) > 1) {
        playerRef.current.seekTo(currentTime, true);
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, [currentTime]);

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