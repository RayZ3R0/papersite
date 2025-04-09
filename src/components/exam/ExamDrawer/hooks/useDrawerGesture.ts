import { useState, useCallback, useEffect, useRef } from 'react';

type DrawerHeight = 'closed' | 'compact' | 'default' | 'full';

interface DrawerState {
  currentHeight: number;
  isDragging: boolean;
  startY: number;
  startHeight: number;
}

const DRAWER_HEIGHTS = {
  closed: 0,     // 0vh (fully closed)
  compact: 30,   // 30vh (peek view)
  default: 65,   // 65vh (standard view)
  full: 80,      // 85vh (leaves space for top navbar)
};

export function useDrawerGesture(onClose?: () => void) {
  const [state, setState] = useState<DrawerState>({
    currentHeight: DRAWER_HEIGHTS.default,
    isDragging: false,
    startY: 0,
    startHeight: DRAWER_HEIGHTS.default,
  });
  
  // Animation frame reference for smoother animation
  const animationRef = useRef<number | null>(null);
  const targetHeightRef = useRef<number>(DRAWER_HEIGHTS.default);

  // Track velocity for momentum scrolling
  const [lastY, setLastY] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  // Animate height change smoothly
  const animateHeight = useCallback(() => {
    const currentHeight = state.currentHeight;
    const targetHeight = targetHeightRef.current;
    const diff = targetHeight - currentHeight;
    
    // Calculate new height with easing
    const easing = 0.2; // Higher = faster animation
    const newHeight = currentHeight + (diff * easing);
    
    // Check if we're close enough to the target
    if (Math.abs(diff) < 0.5) {
      setState(prev => ({
        ...prev,
        currentHeight: targetHeight,
      }));
      animationRef.current = null;
      
      // If drawer is closed completely, call the onClose callback
      if (targetHeight === DRAWER_HEIGHTS.closed && onClose) {
        setTimeout(onClose, 50);
      }
      
      return;
    }
    
    // Update state with new height
    setState(prev => ({
      ...prev,
      currentHeight: newHeight,
    }));
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animateHeight);
  }, [state.currentHeight, onClose]);

  // Find closest snap point
  const getSnapHeight = useCallback((height: number, velocity: number): DrawerHeight => {
    // If velocity is high enough, snap to next/previous point
    const VELOCITY_THRESHOLD = 0.5;
    
    // Handle closing the drawer completely when dragged down quickly
    if (velocity > VELOCITY_THRESHOLD && height < DRAWER_HEIGHTS.compact + 10) {
      return 'closed';
    }
    
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      const heights = Object.entries(DRAWER_HEIGHTS);
      const currentIndex = heights.findIndex(([_, value]) => 
        Math.abs(value - height) < 10
      );
      
      if (velocity < -VELOCITY_THRESHOLD && currentIndex < heights.length - 1) {
        return heights[currentIndex + 1][0] as DrawerHeight;
      }
      if (velocity > VELOCITY_THRESHOLD && currentIndex > 0) {
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
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
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
      Math.max(state.startHeight + deltaY, 0), // Allow 0 for full close
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
    const timeDiff = now - lastTime;
    
    // Calculate velocity (pixels per ms)
    const velocity = timeDiff > 0 ? (lastY - state.startY) / timeDiff : 0;
    
    // Get target height based on velocity and current position
    const snapTo = getSnapHeight(state.currentHeight, velocity);
    
    // Set target height for animation
    targetHeightRef.current = DRAWER_HEIGHTS[snapTo];
    
    // Start animation
    if (animationRef.current === null) {
      animationRef.current = requestAnimationFrame(animateHeight);
    }
    
    setState(prev => ({
      ...prev,
      isDragging: false,
    }));
  }, [state.isDragging, state.currentHeight, state.startY, lastY, lastTime, getSnapHeight, animateHeight]);

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
    return () => {
      mql.removeEventListener('change', handleChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const height = `${state.currentHeight}vh`;
  const isAtFullHeight = state.currentHeight >= DRAWER_HEIGHTS.full - 5;

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