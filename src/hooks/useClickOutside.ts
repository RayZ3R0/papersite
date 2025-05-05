import { useEffect, RefObject } from 'react';

/**
 * Hook that handles clicks outside of the passed ref
 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      // For touch events, use the first touch point
      const target = event.type === 'touchend'
        ? (event as TouchEvent).changedTouches?.[0]?.target
        : event.target;

      if (ref.current && target && !ref.current.contains(target as Node)) {
        handler();
      }
    }

    // Handle both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}

export default useClickOutside;