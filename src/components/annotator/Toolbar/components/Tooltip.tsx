'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  content,
  children,
  delay = 200,
  position = 'top'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const padding = 10;
    const maxLeft = window.innerWidth - tooltipRect.width - padding;
    const maxTop = window.innerHeight - tooltipRect.height - padding;

    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    setTooltipPosition({ top, left });
  };

  // Update position on scroll or resize
  useEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isVisible]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900/90 
              rounded shadow-lg backdrop-blur-sm pointer-events-none select-none
              transition-opacity duration-200 ease-in-out"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              opacity: isVisible ? 1 : 0,
              transform: `scale(${isVisible ? 1 : 0.95})`,
            }}
            role="tooltip"
          >
            {content}
            <div
              className="absolute w-0 h-0 border-transparent border-solid"
              style={{
                ...(position === 'top' && {
                  bottom: '-4px',
                  left: '50%',
                  marginLeft: '-4px',
                  borderWidth: '4px 4px 0',
                  borderTopColor: 'rgb(17 24 39 / 0.9)'
                }),
                ...(position === 'bottom' && {
                  top: '-4px',
                  left: '50%',
                  marginLeft: '-4px',
                  borderWidth: '0 4px 4px',
                  borderBottomColor: 'rgb(17 24 39 / 0.9)'
                }),
                ...(position === 'left' && {
                  right: '-4px',
                  top: '50%',
                  marginTop: '-4px',
                  borderWidth: '4px 0 4px 4px',
                  borderLeftColor: 'rgb(17 24 39 / 0.9)'
                }),
                ...(position === 'right' && {
                  left: '-4px',
                  top: '50%',
                  marginTop: '-4px',
                  borderWidth: '4px 4px 4px 0',
                  borderRightColor: 'rgb(17 24 39 / 0.9)'
                })
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}