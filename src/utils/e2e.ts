import { testingUtils, runStandardTests, TestResult } from './testing';
import { performanceMonitor } from './performance';

interface E2ETestSuite {
  name: string;
  tests: E2ETest[];
}

interface E2ETest {
  name: string;
  steps: TestStep[];
}

interface TestStep {
  name: string;
  action: () => Promise<void>;
  validation: () => Promise<boolean>;
  errorMessage?: string;
}

const criticalPaths: E2ETestSuite = {
  name: 'Critical User Paths',
  tests: [
    {
      name: 'PDF Access and Viewing',
      steps: [
        {
          name: 'Navigate to subject page',
          action: async () => {
            await navigateTo('/subjects/physics');
          },
          validation: async () => {
            return document.title.toLowerCase().includes('physics');
          },
          errorMessage: 'Failed to navigate to subject page'
        },
        {
          name: 'Select unit and paper',
          action: async () => {
            const unitButton = document.querySelector('[data-testid="unit-1"]');
            if (unitButton instanceof HTMLElement) {
              unitButton.click();
            }
          },
          validation: async () => {
            const paperList = document.querySelector('[data-testid="paper-list"]');
            return paperList !== null;
          },
          errorMessage: 'Failed to display paper list'
        },
        {
          name: 'Load PDF viewer',
          action: async () => {
            const paperLink = document.querySelector('[data-testid="paper-link"]');
            if (paperLink instanceof HTMLElement) {
              paperLink.click();
            }
          },
          validation: async () => {
            const loadTime = await testingUtils.testPDFLoading(window.location.href);
            return loadTime < 3000; // 3 seconds max
          },
          errorMessage: 'PDF loading exceeded time limit'
        }
      ]
    },
    {
      name: 'Mobile Navigation Flow',
      steps: [
        {
          name: 'Mobile search functionality',
          action: async () => {
            const searchInput = document.querySelector('[data-testid="search-input"]');
            if (searchInput instanceof HTMLInputElement) {
              searchInput.value = 'physics 2024';
              searchInput.dispatchEvent(new Event('input'));
            }
          },
          validation: async () => {
            const searchResults = document.querySelector('[data-testid="search-results"]');
            return searchResults !== null;
          },
          errorMessage: 'Search results not displayed'
        },
        {
          name: 'Mobile swipe between paper and marking scheme',
          action: async () => {
            const viewer = document.querySelector('[data-testid="pdf-viewer"]');
            if (viewer) {
              simulateSwipe(viewer as HTMLElement, 'left');
            }
          },
          validation: async () => {
            const markingSchemeView = document.querySelector('[data-testid="marking-scheme-view"]');
            return markingSchemeView?.classList.contains('active') ?? false;
          },
          errorMessage: 'Swipe gesture not working'
        }
      ]
    }
  ]
};

// Helper functions
async function navigateTo(path: string): Promise<void> {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', path);
  }
}

function simulateSwipe(element: HTMLElement, direction: 'left' | 'right'): void {
  const start = { x: direction === 'left' ? 300 : 100, y: 150 };
  const end = { x: direction === 'left' ? 100 : 300, y: 150 };

  element.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true,
    touches: [new Touch({ identifier: 0, target: element, ...start })]
  }));

  element.dispatchEvent(new TouchEvent('touchend', {
    bubbles: true,
    changedTouches: [new Touch({ identifier: 0, target: element, ...end })]
  }));
}

// Main test runner
export async function runE2ETests(): Promise<string> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  console.log('Starting E2E tests...');

  // Run standard device and network tests
  const standardResults = await runStandardTests();
  console.log('Standard test results:', standardResults);

  // Run critical path tests
  for (const test of criticalPaths.tests) {
    console.log(`Running test: ${test.name}`);
    
    for (const step of test.steps) {
      try {
        console.log(`  Step: ${step.name}`);
        await step.action();
        const isValid = await step.validation();
        
        if (!isValid) {
          throw new Error(step.errorMessage || 'Step validation failed');
        }
      } catch (error) {
        results.push({
          testCase: {
            name: `${test.name} - ${step.name}`,
            deviceType: 'mobile',
            viewport: { width: 375, height: 667 },
            networkCondition: '4g'
          },
          success: false,
          metrics: {
            pdfLoadTime: 0,
            navigationTime: 0,
            interactionDelay: 0
          },
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }
  }

  // Generate final report
  const report = {
    duration: Date.now() - startTime,
    standardTests: JSON.parse(standardResults),
    criticalPathTests: results,
    performance: performanceMonitor.generateReport()
  };

  return JSON.stringify(report, null, 2);
}

// Utility to check touch target sizes throughout the app
export async function validateTouchTargets(): Promise<string[]> {
  const errors = testingUtils.verifyTouchTargets();
  return errors;
}

// Utility to monitor network performance
export function startNetworkMonitoring(): void {
  performanceMonitor.loadSavedMetrics();
  
  // Listen for navigation events
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      performanceMonitor.logNavigationTiming();
    });
  }
}