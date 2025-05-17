"use client";

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isMinimized: boolean;
  volume: number;
  isMuted: boolean;
  isClosed: boolean;
  previousTracks: Track[]; // Add history tracking
}

export interface PlayerContext extends PlayerState {
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void; // Add previous track functionality
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}