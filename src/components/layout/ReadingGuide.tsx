'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingGuideSettings {
  enabled: boolean;
  color: string;
  opacity: number;
  height: number;
  maskEnabled: boolean;
  maskOpacity: number;
}

const defaultSettings: ReadingGuideSettings = {
  enabled: false,
  color: '#FFD700',
  height: 24,
  opacity: 0.2,
  maskEnabled: false,
  maskOpacity: 0.5
};

function loadSettings(): ReadingGuideSettings {
  if (typeof window === 'undefined') return defaultSettings;
  const saved = localStorage.getItem('papersite:reading-guide');
  return saved ? JSON.parse(saved) : defaultSettings;
}

function saveSettings(settings: ReadingGuideSettings) {
  localStorage.setItem('papersite:reading-guide', JSON.stringify(settings));
}

export default function ReadingGuide() {
  const [settings, setSettings] = useState<ReadingGuideSettings>(defaultSettings);
  const [mouseY, setMouseY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const maskTopRef = useRef<HTMLDivElement>(null);
  const maskBottomRef = useRef<HTMLDivElement>(null);

  const colors = ['#FFD700', '#90EE90', '#87CEEB', '#DDA0DD', '#FFFFFF'];

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (!settings.enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const y = e.clientY - (settings.height / 2);
      setMouseY(y);

      if (settings.maskEnabled) {
        if (maskTopRef.current) {
          maskTopRef.current.style.height = `${y}px`;
        }
        if (maskBottomRef.current) {
          maskBottomRef.current.style.top = `${y + settings.height}px`;
          maskBottomRef.current.style.height = `calc(100vh - ${y + settings.height}px)`;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.enabled) return;

      const STEP = 10;
      
      switch (e.key) {
        case 'ArrowUp':
          setMouseY(prev => Math.max(0, prev - STEP));
          break;
        case 'ArrowDown':
          setMouseY(prev => Math.min(window.innerHeight - settings.height, prev + STEP));
          break;
        case 'Home':
          setMouseY(0);
          break;
        case 'End':
          setMouseY(window.innerHeight - settings.height);
          break;
        case 'PageUp':
          setMouseY(prev => Math.max(0, prev - window.innerHeight / 2));
          break;
        case 'PageDown':
          setMouseY(prev => Math.min(window.innerHeight - settings.height, prev + window.innerHeight / 2));
          break;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings.enabled, settings.height, settings.maskEnabled]);

  const updateSettings = (newSettings: Partial<ReadingGuideSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleShortcut = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'r') {
      updateSettings({ enabled: !settings.enabled });
    }
    if (e.altKey && e.key === 'm') {
      updateSettings({ maskEnabled: !settings.maskEnabled });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [settings]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg 
          shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Reading Guide Settings (Alt + R to toggle)"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {settings.enabled && (
        <>
          <motion.div
            ref={guideRef}
            initial={false}
            animate={{
              y: mouseY,
              backgroundColor: settings.color,
              opacity: settings.opacity
            }}
            className="fixed left-0 right-0 pointer-events-none z-50"
            style={{ height: settings.height }}
            aria-hidden="true"
          />

          {settings.maskEnabled && (
            <>
              <motion.div
                ref={maskTopRef}
                className="fixed left-0 right-0 top-0 bg-black pointer-events-none"
                style={{ opacity: settings.maskOpacity }}
                aria-hidden="true"
              />
              <motion.div
                ref={maskBottomRef}
                className="fixed left-0 right-0 bg-black pointer-events-none"
                style={{ opacity: settings.maskOpacity }}
                aria-hidden="true"
              />
            </>
          )}
        </>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-32 right-4 w-80 bg-white dark:bg-gray-800 
                rounded-lg shadow-xl z-50 p-4"
              role="dialog"
              aria-label="Reading Guide Settings"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => updateSettings({ enabled: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Enable Reading Guide (Alt + R)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Guide Color</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSettings({ color })}
                        className={`w-8 h-8 rounded-full border-2 
                          ${settings.color === color ? 'border-blue-500' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Set guide color to ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Guide Height</label>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={settings.height}
                    onChange={(e) => updateSettings({ height: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Guide Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.1"
                    value={settings.opacity}
                    onChange={(e) => updateSettings({ opacity: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="border-t pt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.maskEnabled}
                      onChange={(e) => updateSettings({ maskEnabled: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Enable Text Masking (Alt + M)</span>
                  </label>

                  {settings.maskEnabled && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Mask Opacity</label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={settings.maskOpacity}
                        onChange={(e) => updateSettings({ maskOpacity: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 text-xs text-gray-500">
                  <p className="font-medium mb-1">Keyboard Controls:</p>
                  <ul className="space-y-1">
                    <li>↑/↓ - Move guide up/down</li>
                    <li>Home/End - Jump to top/bottom</li>
                    <li>PageUp/PageDown - Move by half screen</li>
                    <li>Alt + R - Toggle reading guide</li>
                    <li>Alt + M - Toggle text masking</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}