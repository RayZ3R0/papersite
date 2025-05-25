"use client";

import React from 'react';
import { useQuickOptions } from './QuickOptionsProvider';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon 
} from '@heroicons/react/24/outline';

export default function MinimizedQuickOptions() {
  const { 
    toggleMinimized, 
    isRunning, 
    timeLeft, 
    session,
    setIsRunning,
    workDuration,
    breakDuration
  } = useQuickOptions();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress based on actual durations
  const totalTime = session === 'work' ? workDuration * 60 : breakDuration * 60;
  const progress = (totalTime - timeLeft) / totalTime;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(!isRunning);
  };

  return (
    <div className="group">
      <button
        onClick={toggleMinimized}
        className="w-12 h-12 rounded-full bg-surface border border-border
          hover:scale-110 hover:shadow-lg transition-all duration-300 ease-spring
          hover:-translate-y-1 flex items-center justify-center relative
          hover:border-primary/30 active:scale-95"
        aria-label="Expand quick options"
      >
        {/* Pulse animation for active timer */}
        {isRunning && (
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow" />
        )}

        {/* Progress ring for timer */}
        {isRunning && (
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              className={`stroke-1 ${session === 'work' ? 'stroke-primary/20' : 'stroke-secondary/20'}`}
            />
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              className={`stroke-1 transition-all duration-1000 ${
                session === 'work' ? 'stroke-primary' : 'stroke-secondary'
              }`}
              strokeDasharray={`${progress * 138.23} 138.23`}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Main Icon */}
        <div className="relative z-10 text-text group-hover:text-primary 
          transition-all duration-300 hover:scale-110 active:scale-90">
          <ClockIcon className="w-6 h-6 transition-transform duration-300 hover:scale-110" />
        </div>

        {/* Timer indicator when active */}
        {(isRunning || timeLeft !== workDuration * 60) && (
          <div className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-timer-pulse">
            <div className="w-full h-full bg-current rounded-full"></div>
          </div>
        )}
      </button>

      {/* Quick timer controls - positioned like music player tooltip */}
      {(isRunning || timeLeft !== workDuration * 60) && (
        <div className="absolute bottom-full right-0 mb-2
          opacity-0 group-hover:opacity-100 transition-all duration-300
          pointer-events-none min-w-[120px] transform group-hover:-translate-y-1">
          <div className="bg-surface border border-border rounded-lg py-1.5 px-3
            text-sm text-text shadow-lg transition-all duration-300
            group-hover:border-primary/30 flex items-center justify-between gap-2">
            <span className="text-xs font-mono">
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={handlePlayPause}
              className="w-5 h-5 rounded-full hover:bg-surface-hover flex items-center justify-center
                transition-colors duration-200 pointer-events-auto"
            >
              {isRunning ? (
                <PauseIcon className="w-3 h-3 text-orange-500" />
              ) : (
                <PlayIcon className="w-3 h-3 text-primary" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2
        opacity-0 group-hover:opacity-100 transition-all duration-300
        pointer-events-none min-w-[140px] transform group-hover:-translate-y-1
        ${(isRunning || timeLeft !== workDuration * 60) ? 'hidden' : 'block'}">
        <div className="bg-surface border border-border rounded-lg py-1.5 px-3
          text-sm text-text shadow-lg transition-all duration-300
          group-hover:border-primary/30">
          <p className="font-medium whitespace-nowrap">Quick Options</p>
          <p className="text-xs text-text-muted mt-0.5">
            Pomodoro Timer
          </p>
        </div>
      </div>

      {/* Add animations matching music player */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        @keyframes timer-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-timer-pulse {
          animation: timer-pulse 2s ease-in-out infinite;
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}