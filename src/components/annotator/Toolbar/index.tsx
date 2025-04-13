'use client';

import React, { useState } from 'react';
import { ToolbarProps, defaultToolSettings } from './types';
import DesktopToolbar from './components/DesktopToolbar';
import MobileToolbar from './components/MobileToolbar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import useShortcuts from './hooks/useShortcuts';
import './styles.css';

export type { ToolType, ToolbarProps } from './types';

const defaultPosition = { x: 20, y: 100 };

export default function Toolbar({
  currentTool: externalTool,
  currentColor: externalColor,
  currentSize: externalSize,
  currentOpacity: externalOpacity,
  initiallyVisible = true,
  position = defaultPosition,
  onToolChange = () => {},
  onColorChange = () => {},
  onSizeChange = () => {},
  onOpacityChange = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onClear = () => {},
  onSave = () => {},
  canUndo = false,
  canRedo = false,
}: ToolbarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isVisible, setIsVisible] = useState(initiallyVisible);

  // Initialize with defaults or external values
  const activeTool = externalTool || 'pen';
  const currentColor = externalColor || defaultToolSettings[activeTool === 'highlighter' ? 'highlighter' : 'pen'].defaultColor;
  const strokeSize = externalSize || defaultToolSettings[activeTool].defaultSize;
  const opacity = externalOpacity || defaultToolSettings.highlighter.defaultOpacity;

  // Setup keyboard shortcuts
  useShortcuts({
    onToolChange,
    onUndo,
    onRedo,
    onClear,
    onSave,
    canUndo,
    canRedo,
    isVisible,
    setIsVisible
  });

  const sharedProps = {
    activeTool,
    currentColor,
    strokeSize,
    opacity,
    isVisible,
    canUndo,
    canRedo,
    handleToolChange: onToolChange,
    handleColorChange: onColorChange,
    handleSizeChange: onSizeChange,
    handleOpacityChange: onOpacityChange,
    onUndo,
    onRedo,
    onClear,
    onSave,
    setIsVisible,
  };

  if (isMobile) {
    return <MobileToolbar {...sharedProps} />;
  }

  return (
    <DesktopToolbar 
      {...sharedProps}
      initialPosition={position}
    />
  );
}