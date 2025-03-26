import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toBeInTheDocument(): R;
      toHaveLength(length: number): R;
      toBeLessThan(value: number): R;
      toBe(value: any): R;
    }
  }

  interface Window {
    matchMedia(query: string): MediaQueryList;
  }

  interface MediaQueryList {
    matches: boolean;
    media: string;
    onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  // Test environment globals
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const expect: jest.Expect;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const jest: typeof import('@jest/globals')['jest'];

  interface Touch {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    pageX: number;
    pageY: number;
  }

  interface TouchEvent extends UIEvent {
    touches: TouchList;
    changedTouches: TouchList;
    targetTouches: TouchList;
  }

  interface TouchList {
    length: number;
    item(index: number): Touch | null;
    [index: number]: Touch;
  }
}