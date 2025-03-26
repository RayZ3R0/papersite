import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PDFViewer from '../PDFViewer';
import { performanceMonitor } from '@/utils/performance';
import { testingUtils } from '@/utils/testing';

describe('PDFViewer Component', () => {
  const mockProps = {
    paperUrl: 'https://example.com/paper.pdf',
    markingSchemeUrl: 'https://example.com/scheme.pdf',
    title: 'Test Paper'
  };

  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));
  });

  it('renders both paper and marking scheme iframes on desktop', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));

    render(<PDFViewer {...mockProps} />);
    
    const iframes = screen.getAllByTitle(/Test Paper/);
    expect(iframes).toHaveLength(2);
  });

  it('shows only one view at a time on mobile', () => {
    window.matchMedia = jest.fn().mockImplementation((_query: string) => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));

    render(<PDFViewer {...mockProps} />);
    
    const visibleIframe = screen.getByTitle('Test Paper - Question Paper');
    expect(visibleIframe).toBeVisible();
    
    const switchButton = screen.getByText('Marking Scheme');
    fireEvent.click(switchButton);
    
    const schemeIframe = screen.getByTitle('Test Paper - Marking Scheme');
    expect(schemeIframe).toBeVisible();
  });

  it('handles swipe gestures on mobile', () => {
    window.matchMedia = jest.fn().mockImplementation((_query: string) => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));

    render(<PDFViewer {...mockProps} />);
    
    const viewer = screen.getByTestId('pdf-viewer');
    
    // Simulate swipe left
    fireEvent.touchStart(viewer, {
      touches: [{ clientX: 300, clientY: 150 }]
    });
    
    fireEvent.touchEnd(viewer, {
      changedTouches: [{ clientX: 100, clientY: 150 }]
    });
    
    const schemeIframe = screen.getByTitle('Test Paper - Marking Scheme');
    expect(schemeIframe).toBeVisible();
  });

  it('meets performance requirements', async () => {
    const loadTime = await testingUtils.testPDFLoading(mockProps.paperUrl);
    expect(loadTime).toBeLessThan(3000); // 3 seconds max

    const metrics = performanceMonitor.getMetrics();
    const pdfLoads = metrics.filter(m => m.type === 'pdf-load');
    expect(pdfLoads[0]?.duration).toBeLessThan(3000);
  });

  it('has appropriate touch target sizes', () => {
    render(<PDFViewer {...mockProps} />);
    
    const errors = testingUtils.verifyTouchTargets();
    expect(errors).toHaveLength(0);
  });

  it('maintains aspect ratio and visibility of PDFs', () => {
    render(<PDFViewer {...mockProps} />);
    
    const iframes = screen.getAllByTitle(/Test Paper/);
    iframes.forEach((iframe: HTMLElement) => {
      const styles = window.getComputedStyle(iframe);
      expect(styles.width).not.toBe('0px');
      expect(styles.height).not.toBe('0px');
      expect(styles.visibility).not.toBe('hidden');
    });
  });

  it('shows loading state while PDFs are loading', () => {
    render(<PDFViewer {...mockProps} />);
    
    const loadingIndicators = screen.getAllByRole('progressbar');
    expect(loadingIndicators.length).toBeGreaterThan(0);
  });

  it('handles network errors gracefully', () => {
    const errorProps = {
      ...mockProps,
      paperUrl: 'invalid-url',
    };
    
    render(<PDFViewer {...errorProps} />);
    
    const errorMessage = screen.getByText(/failed to load/i);
    expect(errorMessage).toBeInTheDocument();
  });
});