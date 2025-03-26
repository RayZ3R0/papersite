import puppeteer, { Browser, Page } from 'puppeteer';

interface TestBrowser {
  browser: Browser;
  page: Page;
}

interface CustomNetworkConditions {
  latency: number;
  download: number;
  upload: number;
  offline: boolean;
}

export async function setupTestBrowser(): Promise<TestBrowser> {
  // Use puppeteer instead of puppeteer-core
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport for mobile testing
  await page.setViewport({
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  // Enable request interception for network simulation
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    // Simulate network conditions
    setTimeout(() => {
      request.continue();
    }, 100); // Default 100ms delay
  });

  // Add helper methods to evaluate in browser context
  await page.exposeFunction('getElementProps', (selector: string) => {
    if (typeof document === 'undefined') return null;
    const element = document.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    };
  });

  return { browser, page };
}

export async function teardownTestBrowser({ browser }: TestBrowser): Promise<void> {
  await browser.close();
}

export async function simulateNetworkCondition(
  page: Page,
  condition: 'slow-3g' | 'fast-3g' | '4g' | 'offline'
): Promise<void> {
  const conditions: Record<string, CustomNetworkConditions> = {
    'slow-3g': {
      download: 500_000,
      upload: 250_000,
      latency: 100,
      offline: false
    },
    'fast-3g': {
      download: 1_500_000,
      upload: 750_000,
      latency: 50,
      offline: false
    },
    '4g': {
      download: 4_000_000,
      upload: 2_000_000,
      latency: 20,
      offline: false
    },
    'offline': {
      download: 0,
      upload: 0,
      latency: 0,
      offline: true
    }
  };

  const networkCondition = conditions[condition];
  await (page as any).emulateNetworkConditions(networkCondition);
}

export async function simulateTouch(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<void> {
  await page.touchscreen.touchStart(startX, startY);
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.touchscreen.touchEnd();
}

export async function waitForPDFLoad(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const iframe = document.querySelector('iframe');
    return iframe && (iframe as HTMLIFrameElement).contentWindow;
  });
}

export async function measurePDFLoadTime(page: Page): Promise<number> {
  const startTime = Date.now();
  await waitForPDFLoad(page);
  return Date.now() - startTime;
}

export type TestContext = {
  browser: Browser;
  page: Page;
  measureLoadTime: () => Promise<number>;
  simulateNetwork: (condition: 'slow-3g' | 'fast-3g' | '4g' | 'offline') => Promise<void>;
  simulateTouch: (startX: number, startY: number, endX: number, endY: number) => Promise<void>;
};