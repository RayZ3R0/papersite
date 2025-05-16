interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface Performance {
  memory?: MemoryInfo;
}

interface Window {
  performance: Performance;
  gc?: () => void;
}