import "@testing-library/jest-dom";
import "whatwg-fetch";

// Mock window if it doesn't exist (for node environment)
if (typeof window === "undefined") {
  global.window = {};
}

// Mock URL if it doesn't exist
if (!global.URL) {
  global.URL = {
    createObjectURL: jest.fn(() => "mock-url"),
    revokeObjectURL: jest.fn(),
  };
}

// Mock window.URL if it doesn't exist
if (!window.URL) {
  window.URL = global.URL;
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
if (typeof window.innerWidth === "undefined") {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1024,
  });
}

if (typeof window.innerHeight === "undefined") {
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 768,
  });
}

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
