'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Position } from '../types';

interface UseDraggableProps {
  initialPosition?: Position;
  bounds?: boolean;
  momentum?: boolean;
}

interface DragState {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
  lastTimestamp: number;
}

export default function useDraggable({
  initialPosition = { x: 20, y: 100 },
  bounds = true,
  momentum = true
}: UseDraggableProps = {}) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const rafRef = useRef<number>();

  // Get bounded position
  const getBoundedPosition = useCallback((x: number, y: number): Position => {
    if (!bounds || !elementRef.current) return { x, y };

    const rect = elementRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    };
  }, [bounds]);

  // Update position with RAF
  const updatePosition = useCallback((x: number, y: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const { x: boundedX, y: boundedY } = getBoundedPosition(x, y);
      setPosition({ x: boundedX, y: boundedY });
    });
  }, [getBoundedPosition]);

  // Handle pointer down
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag from handle
    if (!elementRef.current || !e.target) return;
    if (!(e.target as HTMLElement).closest('.toolbar-drag-handle')) return;

    // Capture pointer
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    
    // Initialize drag state
    dragStateRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
      lastX: e.clientX,
      lastY: e.clientY,
      velocityX: 0,
      velocityY: 0,
      lastTimestamp: Date.now()
    };

    // Add grabbing cursor to body
    document.body.style.cursor = 'grabbing';
    
    e.preventDefault();
  }, [position]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !dragStateRef.current) return;

    const now = Date.now();
    const deltaTime = now - dragStateRef.current.lastTimestamp;
    
    if (deltaTime > 0) {
      // Calculate new position
      const newX = e.clientX - dragStateRef.current.startX;
      const newY = e.clientY - dragStateRef.current.startY;
      
      // Update velocity
      dragStateRef.current.velocityX = (e.clientX - dragStateRef.current.lastX) / deltaTime;
      dragStateRef.current.velocityY = (e.clientY - dragStateRef.current.lastY) / deltaTime;
      
      // Update last position and timestamp
      dragStateRef.current.lastX = e.clientX;
      dragStateRef.current.lastY = e.clientY;
      dragStateRef.current.lastTimestamp = now;

      updatePosition(newX, newY);
    }
  }, [isDragging, updatePosition]);

  // Handle pointer up
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging || !dragStateRef.current) return;

    setIsDragging(false);
    document.body.style.cursor = '';

    // Release pointer capture
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }

    // Apply momentum if enabled
    if (momentum) {
      const { velocityX, velocityY } = dragStateRef.current;
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      if (velocity > 0.1) {
        let frame = 0;
        const animate = () => {
          if (frame >= 10) return; // Stop after 10 frames
          
          const progress = 1 - frame / 10; // Linear deceleration
          const newX = position.x + velocityX * 16 * progress; // 16ms per frame
          const newY = position.y + velocityY * 16 * progress;
          
          updatePosition(newX, newY);
          frame++;
          requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
      }
    }

    dragStateRef.current = null;
  }, [isDragging, momentum, position, updatePosition]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handlePointerMove, handlePointerUp]);

  // Set initial position
  useEffect(() => {
    updatePosition(initialPosition.x, initialPosition.y);
  }, [initialPosition.x, initialPosition.y, updatePosition]);

  return {
    position,
    isDragging,
    elementRef,
    handlePointerDown
  };
}