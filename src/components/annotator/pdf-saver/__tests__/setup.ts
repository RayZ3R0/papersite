// Mock canvas and SVG functionality
class MockCanvas {
  getContext() {
    return {
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      getTransform: () => ({ a: 1, d: 1 }),
    };
  }

  toDataURL() {
    return 'data:image/png;base64,mock';
  }
}

// Mock SVG elements and operations
class MockSVGElement {
  setAttribute = jest.fn();
  appendChild = jest.fn();
  removeChild = jest.fn();
}

// Create a mock HTMLImageElement
class MockImage implements Partial<HTMLImageElement> {
  // Required properties for our tests
  public src: string = '';
  public width: number = 0;
  public height: number = 0;
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public complete: boolean = false;
  
  constructor() {
    setTimeout(() => {
      this.complete = true;
      this.width = 595;
      this.height = 842;
      this.onload?.();
    }, 0);
  }
}

// Mock browser globals
(global as any).HTMLCanvasElement = MockCanvas;
(global as any).HTMLImageElement = MockImage;
global.document.createElementNS = jest.fn().mockImplementation(() => new MockSVGElement());
global.document.createElement = jest.fn().mockImplementation((tag) => {
  if (tag === 'canvas') return new MockCanvas();
  if (tag === 'img') return new MockImage();
  return {};
});

// Mock window.URL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock performance.memory
Object.defineProperty(global.performance, 'memory', {
  value: {
    jsHeapSizeLimit: 2147483648,
    totalJSHeapSize: 1073741824,
    usedJSHeapSize: 536870912
  },
  configurable: true
});

// Mock XMLSerializer
(global as any).XMLSerializer = jest.fn().mockImplementation(() => ({
  serializeToString: jest.fn().mockReturnValue('<svg></svg>')
}));

// Mock Blob with proper typing
(global as any).Blob = jest.fn().mockImplementation((content: BlobPart[], options?: BlobPropertyBag) => ({
  size: content[0]?.toString().length || 0,
  type: options?.type || '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(content[0]?.toString().length || 0)),
}));

// Helper to create a mock PDF ArrayBuffer
export function createMockPDFBuffer(): ArrayBuffer {
  const header = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]);
  return header.buffer;
}

// Helper to create mock canvas dimensions
export function createMockViewport(scale: number = 1) {
  return {
    width: 595 * scale,
    height: 842 * scale,
    scale
  };
}

// Add proper typing for test environment
declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      HTMLCanvasElement: typeof HTMLCanvasElement;
      HTMLImageElement: typeof HTMLImageElement;
      URL: typeof URL;
      Blob: typeof Blob;
      performance: Performance;
    }
  }
}