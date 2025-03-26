declare global {
  interface Window {
    testHelpers: {
      waitForElement: (selector: string) => Promise<Element | null>;
    };
  }
}

declare module 'puppeteer' {
  interface NetworkConditions {
    offline?: boolean;
    latency: number;
    downloadThroughput: number;
    uploadThroughput: number;
  }

  interface LaunchOptions {
    headless?: boolean | 'new' | 'shell';
    args?: string[];
  }

  interface Page {
    setOfflineMode(enabled: boolean): Promise<void>;
    emulateNetworkConditions(conditions: NetworkConditions): Promise<void>;
  }
}

export {};