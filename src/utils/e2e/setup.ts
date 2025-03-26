import puppeteer, { Browser, Page } from 'puppeteer';

interface TestBrowser {
  browser: Browser;
  page: Page;
}

export async function setupTestBrowser(): Promise<TestBrowser> {
  const browser = await puppeteer.launch({
    headless: 'new' as any,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

  // Add custom test helpers to the page
  await page.evaluate(() => {
    (window as any).testHelpers = {
      waitForElement: (selector: string) => {
        return new Promise((resolve) => {
          if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
          }

          const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        });
      }
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
  const conditions = {
    'slow-3g': { downloadThroughput: 500_000, uploadThroughput: 250_000, latency: 100 },
    'fast-3g': { downloadThroughput: 1_500_000, uploadThroughput: 750_000, latency: 50 },
    '4g': { downloadThroughput: 4_000_000, uploadThroughput: 2_000_000, latency: 20 },
    'offline': { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
  };

  if (condition === 'offline') {
    await (page as any).setOfflineMode(true);
  } else {
    await page.emulateNetworkConditions(conditions[condition] as any);
  }
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