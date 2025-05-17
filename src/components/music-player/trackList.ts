"use client";

import { Track } from "./types";

// A curated list of study-friendly music tracks
export const tracks: Track[] = [
  {
    id: "2SUwOgmvzK4", // Tame Impala - Let It Happen
    title: "Let It Happen",
    artist: "Tame Impala",
    duration: 467
  },
  {
    id: "5qap5aO4i9A", // lofi hip hop radio - beats to relax/study to
    title: "lofi beats",
    artist: "Lofi Girl",
    duration: 0 // Live stream
  },
  {
    id: "jfKfPfyJRdk", // lofi hip hop radio - beats to sleep/chill to
    title: "chill beats",
    artist: "Lofi Girl",
    duration: 0 // Live stream
  },
  {
    id: "lTRiuFIWV54", // Ambient Study Music
    title: "Ambient Study Music",
    artist: "YourChill",
    duration: 10800
  },
  {
    id: "rHhQGqHikZM", // Classical Study Music
    title: "Classical Focus",
    artist: "StudyMD",
    duration: 7200
  },
  {
    id: "9UMxZofMNbA", // Jazz Study Music
    title: "Jazz for Studying",
    artist: "StudyBeats",
    duration: 9000
  }
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