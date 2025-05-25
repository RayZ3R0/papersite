"use client";

import React, { useState } from 'react';
import { useQuickOptions } from './QuickOptionsProvider';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon,
  Cog6ToothIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function ExpandedQuickOptions() {
  const { 
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
    resetTimer
  } = useQuickOptions();

  const [showSettings, setShowSettings] = useState(false);

  const workOptions = [15, 25, 30, 45, 50];
  const breakOptions = [5, 10, 15, 20];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateWorkDuration = (minutes: number) => {
    setWorkDuration(minutes);
    if (session === 'work' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const updateBreakDuration = (minutes: number) => {
    setBreakDuration(minutes);
    if (session === 'break' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  return (
    <div className="w-80 bg-surface border border-border rounded-lg
      shadow-lg overflow-hidden music-player-fade-in hover:shadow-xl
      transition-all duration-300 ease-spring">
      
      {/* Header - Clickable to minimize */}
      <div 
        onClick={toggleMinimized}
        className="flex items-center justify-between p-4 border-b border-border
          cursor-pointer hover:bg-surface-alt transition-all duration-300 group
          hover:border-primary/30"
      >
        <h3 className="text-sm font-medium group-hover:text-primary transition-colors duration-300 flex items-center">
          {/* <ClockIcon className="w-4 h-4 mr-2" /> */}
          Pomodoro Timer
          <span className="text-xs text-text-muted ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            (click to minimize)
          </span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            disabled={isRunning}
            className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
          >
            <Cog6ToothIcon className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimized();
            }}
            className="text-text-muted hover:text-primary rounded-full p-1 
              hover:bg-surface transition-all duration-300 hover:rotate-90
              hover:scale-110 active:scale-95"
            aria-label="Minimize quick options"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-surface-alt border-b border-border space-y-3">
          <div>
            <label className="block text-xs font-medium text-text mb-2">
              Work Duration (minutes)
            </label>
            <div className="flex gap-2 flex-wrap">
              {workOptions.map(minutes => (
                <button
                  key={minutes}
                  onClick={() => updateWorkDuration(minutes)}
                  disabled={isRunning}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                    workDuration === minutes
                      ? 'bg-primary text-white'
                      : 'bg-surface hover:bg-surface-hover text-text border border-border'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-2">
              Break Duration (minutes)
            </label>
            <div className="flex gap-2 flex-wrap">
              {breakOptions.map(minutes => (
                <button
                  key={minutes}
                  onClick={() => updateBreakDuration(minutes)}
                  disabled={isRunning}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                    breakDuration === minutes
                      ? 'bg-secondary text-white'
                      : 'bg-surface hover:bg-surface-hover text-text border border-border'
                  }`}
                >
                  {minutes}m
                </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="p-6 text-center">
        <div className={`text-4xl font-mono font-bold mb-4 ${
          session === 'work' ? 'text-primary' : 'text-secondary'
        }`}>
          {formatTime(timeLeft)}
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          session === 'work' 
            ? 'bg-primary/10 text-primary' 
            : 'bg-secondary/10 text-secondary'
        }`}>
          {session === 'work' ? `Focus Time (${workDuration}m)` : `Break Time (${breakDuration}m)`}
        </span>
      </div>

      {/* Controls */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <PauseIcon className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                Start
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium
              bg-surface-alt hover:bg-surface-hover text-text border border-border transition-colors"
          >
            <StopIcon className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Stats */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <TrophyIcon className="w-3 h-3" />
            <span>{completedSessions} sessions completed</span>
          </div>
        </div>
      </div>

      {/* Add global styles matching music player */}
      <style jsx global>{`
        .music-player-fade-in {
          animation: playerFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes playerFadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}