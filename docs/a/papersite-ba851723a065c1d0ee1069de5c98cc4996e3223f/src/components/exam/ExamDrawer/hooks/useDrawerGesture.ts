import { useState, useCallback, useEffect, useRef } from 'react';

type DrawerHeight = 'closed' | 'compact' | 'default' | 'full';

interface DrawerState {
  currentHeight: number;
  isDragging: boolean;
  startY: number;
  startHeight: number;
}

// Height threshold for closing the drawer automatically
const CLOSE_THRESHOLD = 20;

const DRAWER_HEIGHTS = {
  closed: 0,     // 0vh (fully closed)
  compact: 30,   // 30vh (peek view)
  default: 65,   // 65vh (standard view)
  full: 85,      // 85vh (leaves space for top navbar)
};

export function useDrawerGesture(onClose?: () => void, isOpen?: boolean) {
  // Force reset when drawer opens
  const drawerKey = useRef(0);
  
  // Use a ref to track first mount vs subsequent renders
  const initialRender = useRef(true);
  
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

  // Reset drawer height when it opens
  useEffect(() => {
    if (isOpen) {
      // Increment key to force reset of hook state
      drawerKey.current += 1;
      
      // Reset to default height when the drawer opens
      setState({
        currentHeight: DRAWER_HEIGHTS.default,
        isDragging: false,
        startY: 0,
        startHeight: DRAWER_HEIGHTS.default,
      });
      
      targetHeightRef.current = DRAWER_HEIGHTS.default;
      
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isOpen]);
  
  // Reset on mount to ensure consistent state
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (isOpen) {
        setState({
          currentHeight: DRAWER_HEIGHTS.default,
          isDragging: false,
          startY: 0,
          startHeight: DRAWER_HEIGHTS.default,
        });
      }
    }
  }, [isOpen]);

  // Animate height change smoothly with improved easing
  const animateHeight = useCallback(() => {
    const currentHeight = state.currentHeight;
    const targetHeight = targetHeightRef.current;
    const diff = targetHeight - currentHeight;
    
    // Calculate new height with better easing
    // Faster for larger differences, smoother for small ones
    const easing = Math.min(0.2, 0.15 + Math.abs(diff) / 200);
    const newHeight = currentHeight + (diff * easing);
    
    // Check if we're close enough to the target
    if (Math.abs(diff) < 0.3) {
      setState(prev => ({
        ...prev,
        currentHeight: targetHeight,
      }));
      animationRef.current = null;
      
      // If drawer is closed completely, call the onClose callback
      if (targetHeight === DRAWER_HEIGHTS.closed && onClose) {
        setTimeout(onClose, 100); // Slight delay to ensure animation completes
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

  // Find closest snap point with improved threshold checking
  const getSnapHeight = useCallback((height: number, velocity: number): DrawerHeight => {
    // Close drawer if it's below the threshold or close to it with downward velocity
    if (height < CLOSE_THRESHOLD || (height < CLOSE_THRESHOLD * 1.5 && velocity > 0.3)) {
      return 'closed';
    }
    
    // If velocity is high enough, snap to next/previous point
    const VELOCITY_THRESHOLD = 0.4; // Lower threshold for more responsive feel
    
    // Handle fast swipe down at any height to close
    if (velocity > VELOCITY_THRESHOLD * 1.5) {
      return 'closed';
    }
    
    // Handle large velocity to snap to next/previous
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      // Snap to appropriate height based on velocity direction
      if (velocity < 0) {
        // Swiping up - go to next higher position
        if (height < DRAWER_HEIGHTS.compact + 5) return 'compact';
        if (height < DRAWER_HEIGHTS.default + 5) return 'default';
        return 'full';
      } else {
        // Swiping down - go to next lower position
        if (height > DRAWER_HEIGHTS.default - 5) return 'default';
        if (height > DRAWER_HEIGHTS.compact - 5) return 'compact';
        return 'closed';
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

  // Handle touch move with improved tracking
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!state.isDragging) return;

    const touch = e.touches[0];
    const deltaY = (state.startY - touch.clientY) / window.innerHeight * 100;
    const newHeight = Math.min(
      Math.max(state.startHeight + deltaY, 0), // Allow 0 for full close
      DRAWER_HEIGHTS.full
    );

    const now = Date.now();
    // Update tracking values for better velocity calculation
    if (now - lastTime > 10) { // Debounce updates for more accurate readings
      setLastY(touch.clientY);
      setLastTime(now);
    }

    setState(prev => ({
      ...prev,
      currentHeight: newHeight,
    }));
  }, [state.isDragging, state.startHeight, state.startY, lastTime]);

  // Handle touch end with improved velocity calculation
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!state.isDragging) return;

    const now = Date.now();
    const timeDiff = now - lastTime;
    
    // Calculate velocity (positive = downward, negative = upward)
    // We normalize by dividing by 10 to get a more manageable value
    let velocity = 0;
    if (timeDiff > 0 && timeDiff < 200) { // Ignore stale velocity data
      velocity = (lastY - e.changedTouches[0].clientY) / timeDiff / 10;
    }
    
    // Get target height based on velocity and current position
    const snapTo = getSnapHeight(state.currentHeight, -velocity); // Flip velocity sign for natural feel
    
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
    // Add key to force re-render when drawer opens
    key: drawerKey.current
  };
}