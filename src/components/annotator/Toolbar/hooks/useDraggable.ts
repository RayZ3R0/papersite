import { useState, useRef, useCallback } from 'react';
import { Position } from '../types/tools';

interface UseDraggableOptions {
  initialPosition: Position;
  bounds?: boolean;
}

export default function useDraggable({
  initialPosition,
  bounds = false
}: UseDraggableOptions) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const initialPosRef = useRef<Position>(position);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!elementRef.current) return;

    setIsDragging(true);
    elementRef.current.setPointerCapture(e.pointerId);
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    initialPosRef.current = position;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      if (bounds && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const padding = 20; // Minimum distance from viewport edges

        // Keep toolbar within viewport bounds
        newX = Math.max(
          -rect.width + padding,
          Math.min(newX, window.innerWidth - padding)
        );
        newY = Math.max(
          0,
          Math.min(newY, window.innerHeight - padding)
        );
      }

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!elementRef.current) return;

      setIsDragging(false);
      elementRef.current.releasePointerCapture(e.pointerId);
      
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }, [position, bounds]);

  return {
    position,
    isDragging,
    elementRef,
    handlePointerDown,
    setPosition
  };
}