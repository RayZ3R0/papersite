import React, { useState, useEffect, useRef } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export function Tooltip({ 
  content,
  children,
  position = 'top',
  delay = 150
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !childRef.current) return;

    const updatePosition = () => {
      const childRect = childRef.current?.getBoundingClientRect();
      if (!childRect || !tooltipRef.current) return;

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = childRect.left + (childRect.width - tooltipRect.width) / 2;
          y = childRect.top - tooltipRect.height - 8;
          break;
        case 'right':
          x = childRect.right + 8;
          y = childRect.top + (childRect.height - tooltipRect.height) / 2;
          break;
        case 'bottom':
          x = childRect.left + (childRect.width - tooltipRect.width) / 2;
          y = childRect.bottom + 8;
          break;
        case 'left':
          x = childRect.left - tooltipRect.width - 8;
          y = childRect.top + (childRect.height - tooltipRect.height) / 2;
          break;
      }

      // Keep tooltip within viewport
      x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
      y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

      setCoords({ x, y });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position]);

  // Clone the child element with the ref and event handlers
  const child = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
  });

  return (
    <>
      {child}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-50 px-2 py-1 text-xs font-medium text-white 
            bg-gray-900 dark:bg-gray-800 rounded shadow-lg 
            pointer-events-none transition-opacity duration-200"
          style={{
            left: coords.x,
            top: coords.y,
          }}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45
              ${position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' : ''}
              ${position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' : ''}
              ${position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 -mr-1' : ''}
              ${position === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -ml-1' : ''}
            `}
          />
        </div>
      )}
    </>
  );
}