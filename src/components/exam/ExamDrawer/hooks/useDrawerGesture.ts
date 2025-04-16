import { useState, useCallback, useEffect, useRef } from 'react';

type DrawerHeight = 'closed' | 'compact' | 'default' | 'full';

interface DrawerState {
  currentHeight: number;
  isDragging: boolean;
  startY: number;
  startHeight: number;
}

interface VelocityTracker {
  positions: Array<{ y: number; time: number }>;
  lastPosition: { y: number; time: number } | null;
}

// Height threshold for closing the drawer automatically
const CLOSE_THRESHOLD = 15;

const DRAWER_HEIGHTS = {
  closed: 0,     // 0vh (fully closed)
  compact: 30,   // 30vh (peek view)
  default: 65,   // 65vh (standard view)
  full: 90,      // 90vh (leaves space for top navbar)
};

// Maximum velocity to consider (prevents extreme flicks)
const MAX_VELOCITY = 2.0;

// Spring physics constants
const SPRING_TENSION = 0.2;
const FRICTION = 0.8;
const BOUNCE_FACTOR = 0.05;

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
  
  // Enhanced velocity tracking
  const velocityTrackerRef = useRef<VelocityTracker>({
    positions: [],
    lastPosition: null,
  });

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
      
      // Reset velocity tracker
      velocityTrackerRef.current = {
        positions: [],
        lastPosition: null,
      };
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

  // Calculate velocity based on position history
  const calculateVelocity = useCallback(() => {
    const positions = velocityTrackerRef.current.positions;
    
    // Need at least 2 positions to calculate velocity
    if (positions.length < 2) return 0;
    
    // Use the last 5 positions for a more stable velocity
    const recentPositions = positions.slice(-5);
    
    // If we have only one position, return 0
    if (recentPositions.length < 2) return 0;
    
    const first = recentPositions[0];
    const last = recentPositions[recentPositions.length - 1];
    
    const timeDelta = last.time - first.time;
    if (timeDelta <= 0) return 0;
    
    // Calculate pixels per millisecond, then scale for better control
    // Positive velocity means swiping DOWN, negative means swiping UP
    const velocity = (last.y - first.y) / timeDelta * 10;
    
    // Cap velocity to prevent extreme flicks
    return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
  }, []);

  // Improved animation with spring physics for more natural feel
  const animateHeight = useCallback(() => {
    const currentHeight = state.currentHeight;
    const targetHeight = targetHeightRef.current;
    const diff = targetHeight - currentHeight;
    
    // Apply spring physics for natural movement
    let force = diff * SPRING_TENSION;
    
    // Apply bounce effect when hitting bounds
    if (currentHeight <= 0) {
      force += -currentHeight * BOUNCE_FACTOR;
    } else if (currentHeight >= DRAWER_HEIGHTS.full) {
      force += (DRAWER_HEIGHTS.full - currentHeight) * BOUNCE_FACTOR;
    }
    
    // Calculate new height with simulated physics
    const delta = force * FRICTION;
    const newHeight = currentHeight + delta;
    
    // Stop animation when we're close enough
    if (Math.abs(diff) < 0.1 && Math.abs(delta) < 0.05) {
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

  // Improved snap logic with better velocity sensitivity
  const getSnapHeight = useCallback((height: number, velocity: number): DrawerHeight => {
    // Different snap behavior based on velocity and position
    
    // Strong downward flick - always close
    if (velocity > 0.8) {
      return 'closed';
    }
    
    // Strong upward flick - always maximize
    if (velocity < -0.8) {
      return 'full';
    }
    
    // Close drawer if very close to bottom
    if (height < CLOSE_THRESHOLD) {
      return 'closed';
    }
    
    // In-between movement with moderate velocity
    if (Math.abs(velocity) > 0.3) {
      if (velocity > 0) { // Moving down
        // Handle downward motion with moderate velocity
        if (height < DRAWER_HEIGHTS.default) {
          // Below middle point, go to compact or close
          return height < DRAWER_HEIGHTS.compact / 2 ? 'closed' : 'compact';
        } else {
          // Above middle point, go to default
          return 'default';
        }
      } else { // Moving up
        // Handle upward motion with moderate velocity
        if (height < DRAWER_HEIGHTS.compact) {
          // From bottom area, go to compact
          return 'compact';
        } else if (height < DRAWER_HEIGHTS.default) {
          // From compact area, go to default
          return 'default';
        } else {
          // From default or higher, go to full
          return 'full';
        }
      }
    }
    
    // No significant velocity - snap to closest point
    const distances = Object.entries(DRAWER_HEIGHTS).map(([key, value]) => ({
      key: key as DrawerHeight,
      distance: Math.abs(value - height),
    }));
    
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].key;
  }, []);

  // Track movement for velocity calculation
  const trackMovement = useCallback((y: number) => {
    const now = Date.now();
    const positions = velocityTrackerRef.current.positions;
    
    // Keep recent positions for accurate velocity
    positions.push({ y, time: now });
    
    // Limit the number of tracked positions to avoid memory buildup
    if (positions.length > 10) {
      positions.shift();
    }
    
    velocityTrackerRef.current.lastPosition = { y, time: now };
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
    
    // Reset velocity tracking
    velocityTrackerRef.current = {
      positions: [{ y: touch.clientY, time: Date.now() }],
      lastPosition: { y: touch.clientY, time: Date.now() },
    };
    
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
    trackMovement(touch.clientY);
    
    // Calculate relative movement in vh units
    const deltaY = (state.startY - touch.clientY) / window.innerHeight * 100;
    
    // Allow slight over-dragging with resistance
    let newHeight = state.startHeight + deltaY;
    
    // Add resistance when dragging beyond limits
    if (newHeight < 0) {
      newHeight = newHeight * 0.3; // Strong resistance when pulled below closed
    } else if (newHeight > DRAWER_HEIGHTS.full) {
      const overDrag = newHeight - DRAWER_HEIGHTS.full;
      newHeight = DRAWER_HEIGHTS.full + overDrag * 0.3; // Resistance when pulled above full
    }

    setState(prev => ({
      ...prev,
      currentHeight: newHeight,
    }));
  }, [state.isDragging, state.startHeight, state.startY, trackMovement]);

  // Handle touch end with improved velocity calculation
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!state.isDragging) return;

    // Track final position
    trackMovement(e.changedTouches[0].clientY);
    
    // Calculate velocity (positive = downward, negative = upward)
    const velocity = calculateVelocity();
    
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
  }, [state.isDragging, state.currentHeight, trackMovement, calculateVelocity, getSnapHeight, animateHeight]);

  // Special handler for the pull bar - swipe down to close, up to maximize
  const handlePullBarTouchStart = useCallback((e: React.TouchEvent) => {
    handleTouchStart(e);
  }, [handleTouchStart]);

  const handlePullBarTouchMove = useCallback((e: React.TouchEvent) => {
    handleTouchMove(e);
  }, [handleTouchMove]);

  const handlePullBarTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!state.isDragging) return;

    // Track final position
    trackMovement(e.changedTouches[0].clientY);
    
    // Calculate velocity
    const velocity = calculateVelocity();
    
    // Special behavior for pull bar:
    // If swiping down with sufficient velocity, close drawer
    // If swiping up with sufficient velocity, maximize drawer
    let snapTo: DrawerHeight;
    
    if (velocity > 0.2) {
      // Swiping down - close drawer
      snapTo = 'closed';
    } else if (velocity < -0.2) {
      // Swiping up - maximize drawer
      snapTo = 'full';
    } else {
      // No significant velocity - use normal snapping logic
      snapTo = getSnapHeight(state.currentHeight, velocity);
    }
    
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
  }, [state.isDragging, trackMovement, calculateVelocity, getSnapHeight, animateHeight]);

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

  // Set drawer to specific height (for programmatic control)
  const setDrawerHeight = useCallback((heightType: DrawerHeight) => {
    targetHeightRef.current = DRAWER_HEIGHTS[heightType];
    
    // Start animation
    if (animationRef.current === null) {
      animationRef.current = requestAnimationFrame(animateHeight);
    }
  }, [animateHeight]);

  // Close drawer programmatically
  const closeDrawer = useCallback(() => {
    setDrawerHeight('closed');
  }, [setDrawerHeight]);

  // Open drawer to default height programmatically
  const openDrawer = useCallback(() => {
    setDrawerHeight('default');
  }, [setDrawerHeight]);

  const height = `${state.currentHeight}vh`;
  const isAtFullHeight = state.currentHeight >= DRAWER_HEIGHTS.full - 5;
  const isClosing = !state.isDragging && targetHeightRef.current === DRAWER_HEIGHTS.closed;

  return {
    height,
    isAtFullHeight,
    isClosing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    pullBarHandlers: {
      onTouchStart: handlePullBarTouchStart,
      onTouchMove: handlePullBarTouchMove,
      onTouchEnd: handlePullBarTouchEnd,
    },
    // Extra controls for programmatic manipulation
    controls: {
      close: closeDrawer,
      open: openDrawer,
      setHeight: setDrawerHeight,
    },
    // Add key to force re-render when drawer opens
    key: drawerKey.current
  };
}