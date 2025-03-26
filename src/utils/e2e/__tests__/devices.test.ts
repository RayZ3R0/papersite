import { runE2ETest } from '../index';
import { devices } from 'playwright';

describe('Device Compatibility Tests', () => {
  test('responsive layout on mobile portrait', async () => {
    await runE2ETest('Mobile Portrait', async (context) => {
      await context.page.setViewportSize(devices['iPhone 12'].viewport);
      await context.page.goto('/');
      
      // Check mobile navigation is visible
      const mobileNavVisible = await context.page.evaluate(() => {
        const nav = document.querySelector('[data-testid="mobile-nav"]');
        if (!nav) return false;
        
        const style = window.getComputedStyle(nav);
        return style.display !== 'none';
      });

      expect(mobileNavVisible).toBe(true);

      // Verify search box is full width on mobile
      const searchBoxWidth = await context.page.evaluate(() => {
        const searchBox = document.querySelector('[data-testid="search-box"]');
        if (!searchBox) return 0;
        return searchBox.clientWidth;
      });

      const viewportWidth = devices['iPhone 12'].viewport.width;
      expect(searchBoxWidth).toBeGreaterThan(viewportWidth * 0.9);
    });
  });

  test('responsive layout on mobile landscape', async () => {
    await runE2ETest('Mobile Landscape', async (context) => {
      const viewport = {
        ...devices['iPhone 12 landscape'].viewport,
        width: 844,
        height: 390
      };
      await context.page.setViewportSize(viewport);
      await context.page.goto('/');

      // Verify landscape-specific styles
      const hasLandscapeLayout = await context.page.evaluate(() => {
        const container = document.querySelector('[data-testid="main-container"]');
        if (!container) return false;
        
        const style = window.getComputedStyle(container);
        return style.maxWidth === '100%' && style.paddingLeft === '0px';
      });

      expect(hasLandscapeLayout).toBe(true);
    });
  });

  test('tablet layout', async () => {
    await runE2ETest('Tablet', async (context) => {
      await context.page.setViewportSize(devices['iPad Pro 11'].viewport);
      await context.page.goto('/');

      // Verify tablet-specific layout
      const hasTabletLayout = await context.page.evaluate(() => {
        const container = document.querySelector('[data-testid="main-container"]');
        if (!container) return false;
        
        const style = window.getComputedStyle(container);
        return parseInt(style.maxWidth) >= 768;
      });

      expect(hasTabletLayout).toBe(true);
    });
  });

  test('desktop layout', async () => {
    await runE2ETest('Desktop', async (context) => {
      await context.page.setViewportSize({ width: 1440, height: 900 });
      await context.page.goto('/');

      // Verify desktop layout features
      const hasDesktopLayout = await context.page.evaluate(() => {
        const container = document.querySelector('[data-testid="main-container"]');
        if (!container) return false;
        
        const style = window.getComputedStyle(container);
        return parseInt(style.maxWidth) >= 1200;
      });

      expect(hasDesktopLayout).toBe(true);

      // Verify side-by-side PDF view is present
      const hasSideBySideView = await context.page.evaluate(() => {
        const pdfContainer = document.querySelector('[data-testid="pdf-container"]');
        return pdfContainer?.classList.contains('grid-cols-2') ?? false;
      });

      expect(hasSideBySideView).toBe(true);
    });
  });
});