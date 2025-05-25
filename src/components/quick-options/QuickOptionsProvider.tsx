"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface QuickOptionsContextType {
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  // Pomodoro state
  workDuration: number;
  setWorkDuration: (duration: number) => void;
  breakDuration: number;
  setBreakDuration: (duration: number) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  session: 'work' | 'break';
  setSession: (session: 'work' | 'break') => void;
  completedSessions: number;
  setCompletedSessions: (sessions: number) => void;
  // Timer functions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  playNotificationSound: (type: 'work' | 'break') => void;
}

const QuickOptionsContext = createContext<QuickOptionsContextType | null>(null);

export const useQuickOptions = () => {
  const context = useContext(QuickOptionsContext);
  if (!context) {
    throw new Error('useQuickOptions must be used within QuickOptionsProvider');
  }
  return context;
};

export function QuickOptionsProvider({ children }: { children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(true);
  
  // Pomodoro states
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMinimized = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  // Audio notification function
  const playNotificationSound = useCallback((type: 'work' | 'break') => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'break') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, []);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          
          if (session === 'work') {
            setCompletedSessions(prev => prev + 1);
            setSession('break');
            setTimeLeft(breakDuration * 60);
            playNotificationSound('break');
          } else {
            setSession('work');
            setTimeLeft(workDuration * 60);
            playNotificationSound('work');
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [session, workDuration, breakDuration, playNotificationSound]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSession('work');
    setTimeLeft(workDuration * 60);
  }, [workDuration]);

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start timer when running state changes
  React.useEffect(() => {
    if (isRunning && !intervalRef.current) {
      startTimer();
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, startTimer]);

  return (
    <QuickOptionsContext.Provider value={{
      isMinimized,
      setIsMinimized,
      toggleMinimized,
      workDuration,
      setWorkDuration,
      breakDuration,
      setBreakDuration,
      timeLeft,
      setTimeLeft,
      isRunning,
      setIsRunning,
      session,
      setSession,
      completedSessions,
      setCompletedSessions,
      startTimer,
      pauseTimer,
      resetTimer,
      playNotificationSound
    }}>
      {children}
    </QuickOptionsContext.Provider>
  );
}