declare global {
  interface Window {
    connection?: any;
  }
  interface Navigator {
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
      saveData: boolean;
      addEventListener: (type: string, listener: EventListener) => void;
    };
  }
}

type PerformanceMetric = {
  timestamp: number;
  duration: number;
  type: string;
  details?: any;
};

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private networkInfo: Navigator['connection'] | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupNetworkObserver();
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupNetworkObserver() {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      this.networkInfo = navigator.connection || null;
      if (this.networkInfo) {
        this.networkInfo.addEventListener('change', () => {
          if (this.networkInfo) {
            this.logMetric('network-change', {
              effectiveType: this.networkInfo.effectiveType,
              downlink: this.networkInfo.downlink,
              rtt: this.networkInfo.rtt
            });
          }
        });
      }
    }
  }

  public logMetric(type: string, details?: any) {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      duration: typeof window !== 'undefined' ? window.performance.now() : 0,
      type,
      details
    };
    this.metrics.push(metric);
    this.saveMetrics();
  }

  public startTimer(id: string) {
    const start = typeof window !== 'undefined' ? window.performance.now() : 0;
    return () => {
      const duration = (typeof window !== 'undefined' ? window.performance.now() : 0) - start;
      this.logMetric('timer', { id, duration });
      return duration;
    };
  }

  public logPDFLoadTime(url: string, loadTime: number) {
    this.logMetric('pdf-load', { url, loadTime });
  }

  public logNavigationTiming() {
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      this.logMetric('navigation-timing', {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domLoad: timing.domContentLoadedEventEnd - navigationStart,
        fullPageLoad: timing.loadEventEnd - navigationStart
      });
    }
  }

  public getMetrics() {
    return this.metrics;
  }

  public getNetworkInfo() {
    return this.networkInfo ? {
      effectiveType: this.networkInfo.effectiveType,
      downlink: this.networkInfo.downlink,
      rtt: this.networkInfo.rtt,
      saveData: this.networkInfo.saveData
    } : null;
  }

  private saveMetrics() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('performance-metrics', JSON.stringify(this.metrics));
      } catch (e) {
        console.warn('Failed to save metrics to localStorage:', e);
      }
    }
  }

  public loadSavedMetrics() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('performance-metrics');
        if (saved) {
          this.metrics = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load saved metrics:', e);
      }
    }
  }

  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      networkInfo: this.getNetworkInfo(),
      metrics: this.getMetrics(),
      summary: this.generateSummary()
    };
    
    return JSON.stringify(report, null, 2);
  }

  private generateSummary() {
    const pdfLoads = this.metrics.filter(m => m.type === 'pdf-load');
    const navigationEvents = this.metrics.filter(m => m.type === 'navigation-timing');
    
    return {
      totalPDFLoads: pdfLoads.length,
      averagePDFLoadTime: pdfLoads.length > 0 
        ? pdfLoads.reduce((acc, curr) => acc + curr.details.loadTime, 0) / pdfLoads.length 
        : 0,
      averagePageLoadTime: navigationEvents.length > 0
        ? navigationEvents.reduce((acc, curr) => acc + curr.details.fullPageLoad, 0) / navigationEvents.length
        : 0,
      totalMetricsCollected: this.metrics.length,
      metricsBreakdown: this.getMetricsBreakdown()
    };
  }

  private getMetricsBreakdown() {
    const breakdown: { [key: string]: number } = {};
    this.metrics.forEach(metric => {
      breakdown[metric.type] = (breakdown[metric.type] || 0) + 1;
    });
    return breakdown;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();