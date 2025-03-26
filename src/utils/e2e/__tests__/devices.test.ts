import { runE2ETest, TestContext } from '../index';
import { performanceMonitor } from '../../performance';

describe('Device Compatibility Tests', () => {
  jest.setTimeout(30000); // 30 second timeout for device tests

  beforeAll(() => {
    performanceMonitor.loadSavedMetrics();
  });

  test('responsive layout on mobile portrait', async () => {
    await runE2ETest('Mobile Portrait', async (context: TestContext) => {
      await context.page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      });

      await context.page.goto('http://localhost:3000');
      const mobileNav = await context.page.$('[data-testid="mobile-nav"]');
      expect(mobileNav).toBeTruthy();
    });
  });

  test('responsive layout on mobile landscape', async () => {
    await runE2ETest('Mobile Landscape', async (context: TestContext) => {
      await context.page.setViewport({
        width: 667,
        height: 375,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      });

      await context.page.goto('http://localhost:3000');
      const landscapeView = await context.page.$('[data-testid="landscape-view"]');
      expect(landscapeView).toBeTruthy();
    });
  });

  test('tablet layout', async () => {
    await runE2ETest('Tablet', async (context: TestContext) => {
      await context.page.setViewport({
        width: 768,
        height: 1024,
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true
      });

      await context.page.goto('http://localhost:3000');
      const tabletLayout = await context.page.$('[data-testid="tablet-layout"]');
      expect(tabletLayout).toBeTruthy();
    });
  });

  test('desktop layout', async () => {
    await runE2ETest('Desktop', async (context: TestContext) => {
      await context.page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      });

      await context.page.goto('http://localhost:3000');
      const desktopLayout = await context.page.$('[data-testid="desktop-layout"]');
      expect(desktopLayout).toBeTruthy();
    });
  });
});