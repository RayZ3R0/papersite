"use client";

import { Track } from "./types";

// A curated list of study-friendly music tracks
export const tracks: Track[] = [
  {
    id: "MLd3E6_f5Rg",
    title: "Une vie à peindre",
    artist: "Lorien Testard, Alice Duport-Percier, Victor Borba",
    duration: 660
  },
  {
    id: "2SUwOgmvzK4", // Tame Impala - Let It Happen
    title: "Let It Happen",
    artist: "Tame Impala",
    duration: 467
  },
  {
    id: "jfKfPfyJRdk", // lofi hip hop radio - beats to sleep/chill to
    title: "chill beats",
    artist: "Lofi Girl",
    duration: 0 // Live stream
  },
  ];

// Get a random track excluding the current one
export const getRandomTrack = (currentTrack: Track | null): Track => {
  const availableTracks = tracks.filter(track => 
    !currentTrack || track.id !== currentTrack.id
  );
  const randomIndex = Math.floor(Math.random() * availableTracks.length);
  return availableTracks[randomIndex];
};

// Get next track in sequence (with loop)
export const getNextTrack = (currentTrack: Track | null): Track => {
  if (!currentTrack) return tracks[0];
  
  const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
  const nextIndex = (currentIndex + 1) % tracks.length;
  return tracks[nextIndex];
};