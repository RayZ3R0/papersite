import { useState, useCallback, useEffect, useRef } from 'react';

// Drawer states
type DrawerState = 'closed' | 'open' | 'full';

interface GestureState {
  isDragging: boolean;
  startY: number;
  startHeight: number;
}

// Physics constants optimized for better cross-browser behavior
const SPRING_TENSION = 0.3;    // Higher tension for snappier response
const SPRING_FRICTION = 0.82;  // Lower friction for smoother movement
const VELOCITY_THRESHOLD = 0.4; // Higher threshold for more predictable snapping

// Height values in vh units 
const DRAWER_HEIGHTS = {
  closed: 0,
  open: 80,   // Taller default open state
  full: 94,   // Almost full screen with minimal status bar gap
};

export function useDrawerGesture(onClose?: () => void, isOpen?: boolean) {
  // Track drawer animation
  const [currentHeight, setCurrentHeight] = useState(0);
  const [drawerState, setDrawerState] = useState<DrawerState>('closed');
  const animationRef = useRef<number | null>(null);
  const targetHeightRef = useRef<number>(0);
  
  // Track touch gesture state
  const [gesture, setGesture] = useState<GestureState>({
    isDragging: false,
    startY: 0,
    startHeight: 0,
  });
  
  // Enhanced velocity tracking with recent positions array
  const velocityTrackerRef = useRef({
    positions: [] as {y: number, time: number}[],
    velocity: 0,
  });
  
  // Unique key for forcing re-renders
  const drawerKey = useRef(0);
  
  // Respond to external isOpen changes
  useEffect(() => {
    if (isOpen) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [isOpen]);
  
  // Calculate velocity based on recent positions
  const calculateVelocity = useCallback(() => {
    const positions = velocityTrackerRef.current.positions;
    if (positions.length < 2) return 0;
    
    // Use the last 5 positions for smoother velocity calculation
    const recent = positions.slice(-5);
    if (recent.length < 2) return 0;
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDelta = last.time - first.time;
    
    if (timeDelta <= 0) return 0;
    
    // Convert to vh units per second (+ is down, - is up)
    return (last.y - first.y) / timeDelta * 1000 / window.innerHeight * 100;
  }, []);
  
  // Animation function with simpler spring physics
  const animateToTarget = useCallback(() => {
    const target = targetHeightRef.current;
    const diff = target - currentHeight;
    
    // Apply spring physics
    const force = diff * SPRING_TENSION;
    const delta = force * SPRING_FRICTION;
    
    // Update position
    const newHeight = currentHeight + delta;
    setCurrentHeight(newHeight);
    
    // Stop animation when we're close enough
    if (Math.abs(diff) < 0.1 && Math.abs(delta) < 0.05) {
      setCurrentHeight(target);
      animationRef.current = null;
      
      // If drawer is closed completely, call the onClose callback
      if (target === DRAWER_HEIGHTS.closed && onClose) {
        setTimeout(() => onClose(), 50);
      }
      return;
    }
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animateToTarget);
  }, [currentHeight, onClose]);
  
  // Start animation to target height
  const animateTo = useCallback((targetState: DrawerState) => {
    // Cancel existing animation if any
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setDrawerState(targetState);
    targetHeightRef.current = DRAWER_HEIGHTS[targetState];
    animationRef.current = requestAnimationFrame(animateToTarget);
  }, [animateToTarget]);
  
  // Open drawer to default height
  const openDrawer = useCallback(() => {
    drawerKey.current += 1;
    animateTo('open');
  }, [animateTo]);
  
  // Open drawer to full screen
  const openFullDrawer = useCallback(() => {
    animateTo('full');
  }, [animateTo]);
  
  // Close drawer completely
  const closeDrawer = useCallback(() => {
    animateTo('closed');
  }, [animateTo]);
  
  // Track a touch position for velocity calculation
  const trackPosition = useCallback((y: number) => {
    const positions = velocityTrackerRef.current.positions;
    const now = Date.now();
    
    positions.push({ y, time: now });
    
    // Keep array at a manageable size
    if (positions.length > 10) {
      positions.shift();
    }
  }, []);
  
  // Touch start event handler
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
      velocity: 0,
    };
    
    setGesture({
      isDragging: true,
      startY: touch.clientY,
      startHeight: currentHeight,
    });
  }, [currentHeight]);
  
  // Touch move event handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!gesture.isDragging) return;
    
    const touch = e.touches[0];
    
    // Track position for velocity calculation
    trackPosition(touch.clientY);
    
    // Calculate new height based on drag delta (in vh units)
    const deltaY = (gesture.startY - touch.clientY) / window.innerHeight * 100;
    let newHeight = gesture.startHeight + deltaY;
    
    // Simple resistance at boundaries
    if (newHeight < 0) {
      newHeight = newHeight * 0.3;
    } else if (newHeight > DRAWER_HEIGHTS.full) {
      const overshoot = newHeight - DRAWER_HEIGHTS.full;
      newHeight = DRAWER_HEIGHTS.full + overshoot * 0.3;
    }
    
    setCurrentHeight(newHeight);
  }, [gesture, trackPosition]);
  
  // Shared touch end handler for both drawer and pull bar
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!gesture.isDragging) return;
    
    // Track final position
    trackPosition(e.changedTouches[0].clientY);
    
    // Calculate velocity
    const velocity = calculateVelocity();
    
    // Determine target state based on velocity and position
    let targetState: DrawerState;
    
    if (velocity > VELOCITY_THRESHOLD) {
      // Fast downward swipe - close
      targetState = 'closed';
    } else if (velocity < -VELOCITY_THRESHOLD) {
      // Fast upward swipe - open full
      targetState = 'full';
    } else if (currentHeight < DRAWER_HEIGHTS.open * 0.4) {
      // Below 40% of open height - close
      targetState = 'closed';
    } else if (currentHeight > DRAWER_HEIGHTS.open * 1.4) {
      // Above 140% of open height - go full
      targetState = 'full';
    } else {
      // Default to open state
      targetState = 'open';
    }
    
    // Animate to target state
    animateTo(targetState);
    
    setGesture(prev => ({
      ...prev,
      isDragging: false,
    }));
  }, [gesture.isDragging, currentHeight, animateTo, trackPosition, calculateVelocity]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handleResize = () => {
      // Reset to open state on resize
      if (drawerState !== 'closed') {
        setCurrentHeight(DRAWER_HEIGHTS.open);
      }
    };
    
    mql.addEventListener('change', handleResize);
    return () => mql.removeEventListener('change', handleResize);
  }, [drawerState]);
  
  return {
    // CSS height value
    height: `${currentHeight}vh`,
    
    // State indicators
    isAtFullHeight: drawerState === 'full',
    isClosing: drawerState === 'closed',
    
    // Touch handlers for both drawer and pull bar
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    
    // Use same handlers for pull bar
    pullBarHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    
    // Controls for programmatic manipulation
    controls: {
      close: closeDrawer,
      open: openDrawer,
      openFull: openFullDrawer,
    },
    
    // For forcing re-renders when drawer opens
    key: drawerKey.current
  };
}
