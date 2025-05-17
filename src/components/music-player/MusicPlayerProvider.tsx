"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Track, PlayerState, PlayerContext } from "./types";
import { getNextTrack, tracks } from "./trackList";
import { saveTrackPosition, getTrackPosition, clearTrackPosition } from "./store";

const VOLUME_KEY = "music-player-volume";
const IS_MINIMIZED_KEY = "music-player-minimized";

const defaultState: PlayerState = {
  currentTrack: tracks[0],
  isPlaying: false,
  isMinimized: true,
  isClosed: false,
  volume: 0.5,
  isMuted: false,
  currentTime: 0
};

const MusicPlayerContext = createContext<PlayerContext | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>(defaultState);

  // Load saved preferences
  useEffect(() => {
    const savedVolume = localStorage.getItem(VOLUME_KEY);
    const savedMinimized = localStorage.getItem(IS_MINIMIZED_KEY);

    setState(prev => ({
      ...prev,
      volume: savedVolume ? parseFloat(savedVolume) : prev.volume,
      isMinimized: savedMinimized ? savedMinimized === "true" : prev.isMinimized
    }));
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, state.volume.toString());
      localStorage.setItem(IS_MINIMIZED_KEY, state.isMinimized.toString());
    } catch (error) {
      console.error('Failed to save music player preferences:', error);
    }
  }, [state.volume, state.isMinimized]);

  const playTrack = (track: Track) => {
    const savedPosition = getTrackPosition(track.id);
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      currentTime: savedPosition
    }));
  };

  const pauseTrack = () => {
    if (state.currentTrack) {
      saveTrackPosition(state.currentTrack.id, state.currentTime);
    }
    setState(prev => ({
      ...prev,
      isPlaying: false
    }));
  };

  const nextTrack = () => {
    if (!state.currentTrack) return;

    // Save position of current track before changing
    saveTrackPosition(state.currentTrack.id, state.currentTime);
    
    const nextTrack = getNextTrack(state.currentTrack);
    // Load saved position for next track
    const nextPosition = getTrackPosition(nextTrack.id);
    
    setState(prev => ({
      ...prev,
      currentTrack: nextTrack,
      currentTime: nextPosition,
      isPlaying: true // Ensure playback continues on track change
    }));
  };

  const setVolume = (volume: number) => {
    setState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
      isMuted: false
    }));
  };

  const toggleMute = () => {
    setState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const toggleMinimize = () => {
    if (!state.isClosed) {
      setState(prev => ({
        ...prev,
        isMinimized: !prev.isMinimized
      }));
    }
  };

  const closePlayer = () => {
    setState(prev => ({
      ...prev,
      isClosed: true,
      isPlaying: false
    }));
  };

  const updateCurrentTime = (time: number) => {
    if (state.currentTrack) {
      const newTime = Math.max(0, time);
      setState(prev => ({
        ...prev,
        currentTime: newTime
      }));
      // Save position periodically during playback
      if (state.isPlaying) {
        saveTrackPosition(state.currentTrack.id, newTime);
      }
    }
  };

  const seekTo = (time: number) => {
    if (state.currentTrack) {
      const newTime = Math.max(0, Math.min(time, state.currentTrack.duration));
      saveTrackPosition(state.currentTrack.id, newTime);
      setState(prev => ({
        ...prev,
        currentTime: newTime
      }));
    }
  };

  const value: PlayerContext = {
    ...state,
    playTrack,
    pauseTrack,
    nextTrack,
    setVolume,
    toggleMute,
    toggleMinimize,
    closePlayer,
    updateCurrentTime,
    seekTo
  };

  // Don't render children if player is closed
  if (state.isClosed) {
    return null;
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}