/**
 * Creates a throttled function that only invokes the provided function at most once per
 * specified time period, using requestAnimationFrame for smooth animations.
 * 
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastRafId: number | undefined;
  let lastTime = 0;

  return function throttled(this: any, ...args: Parameters<T>) {
    const context = this;

    // If RAF is queued, cancel it
    if (lastRafId) {
      cancelAnimationFrame(lastRafId);
    }

    const now = Date.now();

    if (!inThrottle) {
      func.apply(context, args);
      lastTime = now;
      inThrottle = true;
    }

    lastRafId = requestAnimationFrame(() => {
      if (now - lastTime >= limit) {
        func.apply(context, args);
        lastTime = now;
      }
      inThrottle = false;
    });
  };
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function debounced(this: any, ...args: Parameters<T>) {
    const context = this;

    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}