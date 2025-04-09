import { useState, useCallback, useEffect } from 'react';

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

  // Track velocity for momentum scrolling
  const [lastY, setLastY] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  // Find closest snap point
  const getSnapHeight = useCallback((height: number, velocity: number): DrawerHeight => {
    // If velocity is high enough, snap to next/previous point
    const VELOCITY_THRESHOLD = 1.5;
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      const heights = Object.entries(DRAWER_HEIGHTS);
      const currentIndex = heights.findIndex(([_, value]) => 
        Math.abs(value - height) < 10
      );
      
      if (velocity < 0 && currentIndex < heights.length - 1) {
        return heights[currentIndex + 1][0] as DrawerHeight;
      }
      if (velocity > 0 && currentIndex > 0) {
        return heights[currentIndex - 1][0] as DrawerHeight;
      }
    }

    // Otherwise snap to closest point
    const distances = Object.entries(DRAWER_HEIGHTS).map(([key, value]) => ({
      key: key as DrawerHeight,
      distance: Math.abs(value - height),
    }));
    
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].key;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setLastY(touch.clientY);
    setLastTime(Date.now());
    setState(prev => ({
      ...prev,
      isDragging: true,
      startY: touch.clientY,
      startHeight: prev.currentHeight,
    }));
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!state.isDragging) return;

    const touch = e.touches[0];
    const deltaY = (state.startY - touch.clientY) / window.innerHeight * 100;
    const newHeight = Math.min(
      Math.max(state.startHeight + deltaY, DRAWER_HEIGHTS.compact),
      DRAWER_HEIGHTS.full
    );

    setLastY(touch.clientY);
    setLastTime(Date.now());

    setState(prev => ({
      ...prev,
      currentHeight: newHeight,
    }));
  }, [state.isDragging, state.startHeight, state.startY]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!state.isDragging) return;

    const now = Date.now();
    const velocity = (lastY - state.startY) / (now - lastTime); // pixels per ms
    const snapTo = getSnapHeight(state.currentHeight, velocity);

    setState(prev => ({
      ...prev,
      isDragging: false,
      currentHeight: DRAWER_HEIGHTS[snapTo],
    }));
  }, [state.isDragging, state.currentHeight, state.startY, lastY, lastTime, getSnapHeight]);

  // Clean up function
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setState(prev => ({
          ...prev,
          isDragging: false,
          currentHeight: DRAWER_HEIGHTS.default,
        }));
      }
    };

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const height = `${state.currentHeight}vh`;
  const isAtFullHeight = state.currentHeight === DRAWER_HEIGHTS.full;

  return {
    height,
    isAtFullHeight,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}