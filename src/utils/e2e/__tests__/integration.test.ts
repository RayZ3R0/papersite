import { runE2ETest, TestContext } from '../index';
import { performanceMonitor } from '../../performance';

describe('Integration Tests', () => {
  jest.setTimeout(30000); // 30 second timeout for integration tests

  beforeAll(() => {
    performanceMonitor.loadSavedMetrics();
  });

  describe('PDF Viewer', () => {
    test('loads PDF with proper performance on mobile', async () => {
      await runE2ETest('Mobile PDF Loading', async (context: TestContext) => {
        await context.simulateNetwork('4g');
        await context.page.goto('http://localhost:3000/subjects/physics');
        
        // Navigate to a paper
        await context.page.click('[data-testid="unit-1"]');
        await context.page.click('[data-testid="paper-link"]');
        
        const loadTime = await context.measureLoadTime();
        expect(loadTime).toBeLessThan(3000); // 3 second requirement
      });
    });

    test('supports swipe between paper and marking scheme', async () => {
      await runE2ETest('Mobile Swipe Gesture', async (context: TestContext) => {
        await context.page.goto('http://localhost:3000/papers/physics-2024-jan-u1');
        
        // Wait for PDF to load
        await context.page.waitForSelector('[data-testid="pdf-viewer"]');
        
        // Simulate swipe from right to left
        await context.simulateTouch(300, 150, 100, 150);
        
        // Verify marking scheme is visible
        const schemeVisible = await context.page.evaluate(() => {
          const scheme = document.querySelector('[data-testid="marking-scheme-view"]');
          return scheme?.classList.contains('active');
        });
        
        expect(schemeVisible).toBe(true);
      });
    });
  });

  describe('Network Conditions', () => {
    test('handles offline mode gracefully', async () => {
      await runE2ETest('Offline Mode', async (context: TestContext) => {
        // Load page while online
        await context.page.goto('http://localhost:3000/subjects/physics');
        
        // Switch to offline mode
        await context.simulateNetwork('offline');
        
        // Try to load a paper
        await context.page.click('[data-testid="unit-1"]');
        
        // Should show offline message
        const offlineMessage = await context.page.waitForSelector('[data-testid="offline-message"]');
        expect(offlineMessage).toBeTruthy();
      });
    });

    test('loads under poor network conditions', async () => {
      await runE2ETest('Slow Network', async (context: TestContext) => {
        await context.simulateNetwork('slow-3g');
        await context.page.goto('http://localhost:3000/subjects/physics');
        
        const loadTime = await context.measureLoadTime();
        expect(loadTime).toBeLessThan(5000); // 5 second allowance for slow 3G
      });
    });
  });

  describe('Touch Interactions', () => {
    test('all interactive elements have proper touch targets', async () => {
      await runE2ETest('Touch Targets', async (context: TestContext) => {
        await context.page.goto('http://localhost:3000');
        
        const smallTargets = await context.page.evaluate(() => {
          const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
          return Array.from(interactiveElements).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width < 44 || rect.height < 44;
          }).length;
        });
        
        expect(smallTargets).toBe(0);
      });
    });
  });

  describe('Performance', () => {
    test('meets search response time requirement', async () => {
      await runE2ETest('Search Performance', async (context: TestContext) => {
        await context.page.goto('http://localhost:3000/search');
        
        const startTime = Date.now();
        await context.page.type('[data-testid="search-input"]', 'physics');
        await context.page.waitForSelector('[data-testid="search-results"]');
        
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(500); // 500ms requirement
      });
    });
  });
});