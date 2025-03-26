import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PDFViewerProps {
  paperUrl: string;
  markingSchemeUrl: string;
  title: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ paperUrl, markingSchemeUrl, title }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [showPaper, setShowPaper] = useState(true);

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const difference = touchStart - touchEnd;

    // If swipe distance is more than 50px
    if (Math.abs(difference) > 50) {
      setShowPaper(difference < 0); // Swipe right shows paper, left shows marking scheme
    }

    setTouchStart(null);
  };

  return (
    <div
      className="w-full h-full relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="pdf-viewer"
    >
      {isDesktop ? (
        // Desktop view - side by side
        <div className="grid grid-cols-2 gap-4 h-full" data-testid="desktop-layout">
          <iframe
            src={paperUrl}
            title={`${title} - Question Paper`}
            className="w-full h-full border-0"
            data-testid="paper-view"
          />
          <iframe
            src={markingSchemeUrl}
            title={`${title} - Marking Scheme`}
            className="w-full h-full border-0"
            data-testid="marking-scheme-view"
          />
        </div>
      ) : (
        // Mobile view - swipeable single view
        <div className="h-full" data-testid="mobile-layout">
          <div className="flex justify-center mb-4 gap-4">
            <button
              onClick={() => setShowPaper(true)}
              className={`px-4 py-2 rounded ${
                showPaper ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              data-testid="paper-button"
            >
              Question Paper
            </button>
            <button
              onClick={() => setShowPaper(false)}
              className={`px-4 py-2 rounded ${
                !showPaper ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              data-testid="scheme-button"
            >
              Marking Scheme
            </button>
          </div>
          <div className="relative h-[calc(100%-4rem)]">
            <iframe
              src={showPaper ? paperUrl : markingSchemeUrl}
              title={`${title} - ${showPaper ? 'Question Paper' : 'Marking Scheme'}`}
              className="w-full h-full border-0"
              data-testid={showPaper ? 'paper-view' : 'marking-scheme-view'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;