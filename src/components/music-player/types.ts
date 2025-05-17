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
}

export interface PlayerContext extends PlayerState {
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}