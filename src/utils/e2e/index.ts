import { setupTestBrowser, TestContext } from './setup';
import { performanceMonitor } from '../performance';

export async function createTestContext(): Promise<TestContext> {
  const { browser, page } = await setupTestBrowser();

  const context: TestContext = {
    browser,
    page,
    measureLoadTime: async () => {
      const startTime = Date.now();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      const duration = Date.now() - startTime;
      performanceMonitor.logMetric('page-load', { duration });
      return duration;
    },
    simulateNetwork: async (condition) => {
      await page.emulateNetworkConditions({
        offline: condition === 'offline',
        downloadThroughput: condition === 'offline' ? 0 : 4_000_000,
        uploadThroughput: condition === 'offline' ? 0 : 2_000_000,
        latency: condition === 'offline' ? 0 : 20,
      } as any);
      performanceMonitor.logMetric('network-condition', { condition });
    },
    simulateTouch: async (startX, startY, endX, endY) => {
      await page.touchscreen.touchStart(startX, startY);
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.touchscreen.touchEnd();
      performanceMonitor.logMetric('touch-interaction', {
        start: { x: startX, y: startY },
        end: { x: endX, y: endY }
      });
    }
  };

  return context;
}

export async function runE2ETest(
  name: string,
  testFn: (context: TestContext) => Promise<void>
): Promise<void> {
  let context: TestContext | null = null;

  try {
    console.log(`Running E2E test: ${name}`);
    context = await createTestContext();
    await testFn(context);
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    console.error(`❌ Test failed: ${name}`);
    console.error(error);
    throw error;
  } finally {
    if (context) {
      await context.browser.close();
    }
  }
}

export type { TestContext };
export * from './setup';