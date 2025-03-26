import "whatwg-fetch";
import "@testing-library/jest-dom";

// Ensure window and document are defined
if (typeof window === "undefined") {
  global.window = {};
}

if (typeof document === "undefined") {
  global.document = {
    createElement: () => ({
      style: {},
      removeChild: () => {},
      appendChild: () => {},
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
      }),
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    documentElement: {
      style: {},
    },
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };
}

// Mock window.matchMedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };
  };

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock createObjectURL
if (typeof window.URL.createObjectURL === "undefined") {
  window.URL.createObjectURL = jest.fn(() => "mock-url");
  window.URL.revokeObjectURL = jest.fn();
}

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    blob: () => Promise.resolve(new Blob()),
    text: () => Promise.resolve(""),
  })
);

// Mock Touch events
class Touch {
  constructor(init) {
    Object.assign(this, init);
  }
}

global.Touch = Touch;
global.TouchEvent = class TouchEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.touches = init.touches || [];
    this.changedTouches = init.changedTouches || [];
  }
};

// Set up viewport size
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock performance API
if (typeof window.performance === "undefined") {
  window.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  };
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  if (global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});
