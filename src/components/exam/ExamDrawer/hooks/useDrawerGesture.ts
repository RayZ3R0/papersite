import { useState, useCallback, useEffect, useRef } from 'react';

// Drawer can be in one of three states
type DrawerState = 'closed' | 'open' | 'full';

interface GestureState {
  isDragging: boolean;
  startY: number;
  startHeight: number;
}

// Height values in vh units
const DRAWER_HEIGHTS = {
  closed: 0,
  open: 70, // Standard open height
  full: 92, // Almost full screen (leaves room for status bar)
};

// Physics constants - Instagram-like feel
const SPRING_TENSION = 0.25;
const SPRING_FRICTION = 0.85;
const VELOCITY_THRESHOLD = 0.3; // Lower threshold makes it more responsive to quick swipes

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
  
  // Animation function with spring physics
  const animateToTarget = useCallback(() => {
    const target = targetHeightRef.current;
    const diff = target - currentHeight;
    
    // Apply spring physics for smooth motion
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
        setTimeout(() => onClose(), 50); // Small delay ensures animation completes
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
    
    // Add resistance when pushing beyond limits (Instagram-like elastic feel)
    if (newHeight < 0) {
      newHeight = newHeight * 0.2; // Strong resistance when below zero
    } else if (newHeight > DRAWER_HEIGHTS.full) {
      const overshoot = newHeight - DRAWER_HEIGHTS.full;
      newHeight = DRAWER_HEIGHTS.full + overshoot * 0.2; // Resistance when over maximum
    }
    
    setCurrentHeight(newHeight);
  }, [gesture, trackPosition]);
  
  // Touch end event handler with improved swipe detection
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!gesture.isDragging) return;
    
    // Track final position
    trackPosition(e.changedTouches[0].clientY);
    
    // Calculate velocity using improved method
    const velocity = calculateVelocity();
    let targetState: DrawerState;
    
    // Instagram-like behavior: any significant downward swipe closes the drawer
    if (velocity > VELOCITY_THRESHOLD) {
      // Fast downward swipe - close drawer
      targetState = 'closed';
    } else if (velocity < -VELOCITY_THRESHOLD) {
      // Fast upward swipe - open to full
      targetState = 'full';
    } else if (currentHeight < DRAWER_HEIGHTS.open / 2) {
      // Below halfway - close
      targetState = 'closed';
    } else if (currentHeight > (DRAWER_HEIGHTS.open + DRAWER_HEIGHTS.full) / 2) {
      // Closer to full than open - go to full
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
  
  // Specialized handler for pull bar that makes swipe down behavior more sensitive
  const handlePullBarTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!gesture.isDragging) return;
    
    // Track final position
    trackPosition(e.changedTouches[0].clientY);
    
    // Calculate velocity using improved method
    const velocity = calculateVelocity();
    let targetState: DrawerState;
    
    // More sensitive to downward swipes on the pull bar (Instagram-like)
    if (velocity > VELOCITY_THRESHOLD * 0.5) { // Even lower threshold for pull bar
      // Downward swipe on pull bar - close drawer
      targetState = 'closed';
    } else if (velocity < -VELOCITY_THRESHOLD) {
      // Fast upward swipe - open to full
      targetState = 'full';
    } else if (currentHeight < DRAWER_HEIGHTS.open / 2) {
      // Below halfway - close
      targetState = 'closed';
    } else if (currentHeight > (DRAWER_HEIGHTS.open + DRAWER_HEIGHTS.full) / 2) {
      // Closer to full than open - go to full
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
    
    // Touch handlers for the main drawer content
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    
    // Specialized handlers for the pull bar with more sensitive close gesture
    pullBarHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handlePullBarTouchEnd,
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