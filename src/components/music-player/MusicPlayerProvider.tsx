"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Track, PlayerState, PlayerContext } from "./types";
import { getRandomTrack, getNextTrack, tracks } from "./trackList";

const VOLUME_KEY = "music-player-volume";
const IS_MINIMIZED_KEY = "music-player-minimized";

const defaultState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  isMinimized: true,
  isClosed: false,
  volume: 0.5,
  isMuted: false
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
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true
    }));
  };

  const pauseTrack = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false
    }));
  };

  const nextTrack = () => {
    if (!state.currentTrack) {
      playTrack(tracks[0]);
      return;
    }
    const nextTrack = getNextTrack(state.currentTrack);
    playTrack(nextTrack);
  };

  const previousTrack = () => {
    // If no current track, just play the first track
    if (!state.currentTrack) {
      playTrack(tracks[0]);
      return;
    }
    
    // Get current track index
    const currentIndex = tracks.findIndex(track => track.id === state.currentTrack?.id);
    
    // Calculate previous track index (with loop)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    
    // Play the previous track
    playTrack(tracks[prevIndex]);
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

  const value: PlayerContext = {
    ...state,
    playTrack,
    pauseTrack,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleMinimize,
    closePlayer
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