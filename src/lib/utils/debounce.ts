export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (options.trailing && lastArgs) {
        func(...lastArgs);
        lastArgs = null;
      }
    };

    if (!timeout && options.leading) {
      func(...args);
    } else {
      lastArgs = args;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}