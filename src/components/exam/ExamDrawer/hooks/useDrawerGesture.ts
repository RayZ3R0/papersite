import { useState, useCallback } from 'react';

type DrawerHeight = 'compact' | 'default' | 'full';

interface DrawerState {
  currentHeight: number;
  isDragging: boolean;
  startY: number;
  startHeight: number;
}

const DRAWER_HEIGHTS = {
  compact: 50,   // 50vh
  default: 75,   // 75vh
  full: 92,      // 92vh (leaves space for top navbar)
};

export function useDrawerGesture() {
  const [state, setState] = useState<DrawerState>({
    currentHeight: DRAWER_HEIGHTS.default,
    isDragging: false,
    startY: 0,
    startHeight: DRAWER_HEIGHTS.default,
  });

  // Find closest snap point
  const getSnapHeight = useCallback((height: number): DrawerHeight => {
    const distances = Object.entries(DRAWER_HEIGHTS).map(([key, value]) => ({
      key: key as DrawerHeight,
      distance: Math.abs(value - height),
    }));
    
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].key;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setState(prev => ({
      ...prev,
      isDragging: true,
      startY: touch.clientY,
      startHeight: prev.currentHeight,
    }));
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isDragging) return;

    const touch = e.touches[0];
    const deltaY = (state.startY - touch.clientY) / window.innerHeight * 100;
    const newHeight = Math.min(
      Math.max(state.startHeight + deltaY, DRAWER_HEIGHTS.compact),
      DRAWER_HEIGHTS.full
    );

    setState(prev => ({
      ...prev,
      currentHeight: newHeight,
    }));
  }, [state.isDragging, state.startHeight, state.startY]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!state.isDragging) return;

    const snapTo = getSnapHeight(state.currentHeight);
    setState(prev => ({
      ...prev,
      isDragging: false,
      currentHeight: DRAWER_HEIGHTS[snapTo],
    }));
  }, [state.isDragging, state.currentHeight, getSnapHeight]);

  const height = `${state.currentHeight}vh`;
  const isAtFullHeight = state.currentHeight === DRAWER_HEIGHTS.full;

  return {
    height,
    isAtFullHeight,
    handlers: {
      onTouchStart: handleTouchStart as unknown as (e: React.TouchEvent) => void,
      onTouchMove: handleTouchMove as unknown as (e: React.TouchEvent) => void,
      onTouchEnd: handleTouchEnd as unknown as (e: React.TouchEvent) => void,
    },
  };
}