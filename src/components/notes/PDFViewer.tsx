'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  XMarkIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  DocumentArrowDownIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Resource } from '@/types/note';

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  unitName?: string;
  topicName?: string;
}

// Toast notification component
function Toast({ message, isVisible }: { message: string; isVisible: boolean }) {
  return (
    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
    }`}>
      <div className="bg-surface border border-border rounded-lg px-4 py-2 shadow-lg">
        <p className="text-text text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

// Native Ad Component for PDF Viewer
function PDFNativeAd({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl26722926.profitableratecpm.com/9befc45ca1d704f1b3ac3e59fd44c8c8/invoke.js';
      document.body.appendChild(script);

      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {}
      };
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`pdf-ad-container ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-text-muted opacity-60">
          Sponsored
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-text-muted hover:text-text transition-colors p-1"
          title="Hide ad"
        >
          <EyeSlashIcon className="h-3 w-3" />
        </button>
      </div>
      <div 
        id="container-9befc45ca1d704f1b3ac3e59fd44c8c8" 
        ref={containerRef}
        className="bg-surface-alt rounded-lg border border-border/30 min-h-[120px] flex items-center justify-center"
      />
    </div>
  );
}

export default function PDFViewer({ isOpen, onClose, resource, unitName, topicName }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(0);
  const [showFullscreenToast, setShowFullscreenToast] = useState(false);
  const [showCloseToast, setShowCloseToast] = useState(false);
  const [copyToast, setCopyToast] = useState('');
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const fullscreenToastTimeoutRef = useRef<NodeJS.Timeout>();
  const closeToastTimeoutRef = useRef<NodeJS.Timeout>();
  const copyToastTimeoutRef = useRef<NodeJS.Timeout>();
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Track screen width
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };
    
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Auto-hide controls functionality
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000); // Hide after 3 seconds of inactivity
  }, []);

  // Show close toast when PDF viewer opens
  useEffect(() => {
    if (isOpen) {
      setShowCloseToast(true);
      resetControlsTimeout(); // Show controls initially
      
      if (closeToastTimeoutRef.current) {
        clearTimeout(closeToastTimeoutRef.current);
      }
      closeToastTimeoutRef.current = setTimeout(() => {
        setShowCloseToast(false);
      }, 4000); // Show for 4 seconds on open
    } else {
      setShowCloseToast(false);
      setIsControlsVisible(true); // Reset controls visibility
    }

    return () => {
      if (closeToastTimeoutRef.current) {
        clearTimeout(closeToastTimeoutRef.current);
      }
    };
  }, [isOpen, resetControlsTimeout]);

  // Show fullscreen toast when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setShowFullscreenToast(true);
      resetControlsTimeout(); // Show controls when entering fullscreen
      
      if (fullscreenToastTimeoutRef.current) {
        clearTimeout(fullscreenToastTimeoutRef.current);
      }
      fullscreenToastTimeoutRef.current = setTimeout(() => {
        setShowFullscreenToast(false);
      }, 3000);
    } else {
      setShowFullscreenToast(false);
    }

    return () => {
      if (fullscreenToastTimeoutRef.current) {
        clearTimeout(fullscreenToastTimeoutRef.current);
      }
    };
  }, [isFullscreen, resetControlsTimeout]);

  // Enhanced keyboard event handling with polling for iframe focus
  useEffect(() => {
    if (!isOpen) return;

    let intervalId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout(); // Show controls on any key press
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
            e.preventDefault();
            setIsFullscreen(prev => !prev);
          }
          break;
      }
    };

    const handleMouseMove = () => {
      resetControlsTimeout(); // Show controls on mouse movement
    };

    // Multiple event listeners for better capture
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, false);
    window.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('mousemove', handleMouseMove);

    // Poll for iframe focus and add event listeners
    intervalId = setInterval(() => {
      if (iframeRef.current) {
        try {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            // Remove existing listeners to prevent duplicates
            iframeDoc.removeEventListener('keydown', handleKeyDown, true);
            iframeDoc.removeEventListener('keydown', handleKeyDown, false);
            iframeDoc.removeEventListener('mousemove', handleMouseMove);
            // Add new listeners
            iframeDoc.addEventListener('keydown', handleKeyDown, true);
            iframeDoc.addEventListener('keydown', handleKeyDown, false);
            iframeDoc.addEventListener('mousemove', handleMouseMove);
          }
        } catch (e) {
          // Cross-origin error - expected for external PDFs
        }
      }
    }, 1000);

    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'pdf-escape') {
        onClose();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, false);
      window.removeEventListener('keydown', handleKeyDown, false);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('message', handleMessage);
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, isFullscreen, onClose, resetControlsTimeout]);

  // Handle share functionality
  const handleShare = async () => {
    try {
      // On PC, copy to clipboard
      await navigator.clipboard.writeText(resource.downloadUrl);
      setCopyToast('URL copied to clipboard!');
      
      if (copyToastTimeoutRef.current) {
        clearTimeout(copyToastTimeoutRef.current);
      }
      copyToastTimeoutRef.current = setTimeout(() => {
        setCopyToast('');
      }, 2000);
    } catch (err) {
      // Fallback if clipboard API fails
      console.error('Failed to copy to clipboard:', err);
      setCopyToast('Failed to copy URL');
      
      if (copyToastTimeoutRef.current) {
        clearTimeout(copyToastTimeoutRef.current);
      }
      copyToastTimeoutRef.current = setTimeout(() => {
        setCopyToast('');
      }, 2000);
    }
  };

  // Create PDF URL with parameters to disable sidebar and fit to width
  const pdfUrl = `${resource.downloadUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&pagemode=none`;

  if (!isOpen) return null;

  // Determine sidebar layout based on screen width
  const showBothSidebars = screenWidth >= 1536; // xl breakpoint
  const showLeftSidebar = screenWidth >= 1024; // lg breakpoint

  // Calculate header height for proper spacing
  const headerHeight = isControlsVisible ? 'h-16' : 'h-0';
  const paddingTop = isControlsVisible ? 'pt-16' : 'pt-0';

  return (
    <div 
      className={`fixed bg-background z-50 transition-all duration-300 ${
        isFullscreen 
          ? 'inset-0' 
          : 'top-16 bottom-0 left-0 right-0' // Respect navbar height (64px = h-16)
      }`}
      ref={viewerRef}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Header Controls - Auto-hide */}
      <div className={`absolute top-0 left-0 right-0 bg-surface border-b border-border px-4 py-3 z-20 transition-all duration-300 ${
        isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-text font-semibold text-base truncate">{resource.title}</h2>
            <div className="text-text-muted text-xs mt-0.5">
              {unitName && <span>Unit: {unitName}</span>}
              {unitName && topicName && <span className="mx-2">•</span>}
              {topicName && <span>Topic: {topicName}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 ml-4">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover text-text transition-colors"
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-4 w-4" />
              ) : (
                <ArrowsPointingOutIcon className="h-4 w-4" />
              )}
            </button>
            
            <a
              href={resource.downloadUrl}
              download
              className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover text-text transition-colors"
              title="Download PDF"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
            </a>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover text-text transition-colors"
              title="Close (Esc)"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {/* Close viewer toast - shows when PDF viewer opens */}
      <Toast 
        message="Press Esc to close the PDF viewer" 
        isVisible={showCloseToast}
      />
      
      {/* Fullscreen toast - shows when entering fullscreen */}
      <Toast 
        message="Press Esc to exit fullscreen" 
        isVisible={showFullscreenToast}
      />
      
      {/* Copy URL toast */}
      {copyToast && (
        <Toast 
          message={copyToast}
          isVisible={!!copyToast}
        />
      )}

      {/* Main PDF Container - Dynamically adjusted for header */}
      <div className={`h-full flex transition-all duration-300 ${
        isFullscreen ? 'pt-0' : (isControlsVisible ? 'pt-16' : 'pt-0')
      }`}>
        {/* Left Sidebar - Show on lg+ screens */}
        {!isFullscreen && showLeftSidebar && (
          <div className="flex flex-col w-64 bg-surface border-r border-border p-4 gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text mb-3">Document Info</h3>
              <div className="space-y-2 text-xs text-text-muted">
                <div>
                  <span className="block font-medium text-text">Title:</span>
                  {resource.title}
                </div>
                {unitName && (
                  <div>
                    <span className="block font-medium text-text">Unit:</span>
                    {unitName}
                  </div>
                )}
                {topicName && (
                  <div>
                    <span className="block font-medium text-text">Topic:</span>
                    {topicName}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar Ad */}
            <PDFNativeAd className="flex-shrink-0" />
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-100">
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            title={resource.title}
            tabIndex={-1}
          />
        </div>

        {/* Right Sidebar - Show only on xl+ screens */}
        {!isFullscreen && showBothSidebars && (
          <div className="flex flex-col w-64 bg-surface border-l border-border p-4">
            <div className="flex-1 space-y-4">
              <h3 className="text-sm font-semibold text-text">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.open(resource.downloadUrl, '_blank')}
                  className="w-full p-2 text-left text-sm bg-surface-alt hover:bg-surface-hover rounded-lg transition-colors text-text"
                >
                  Open in new tab
                </button>
                <button
                  onClick={handleShare}
                  className="w-full p-2 text-left text-sm bg-surface-alt hover:bg-surface-hover rounded-lg transition-colors text-text"
                >
                  Copy URL
                </button>
              </div>
            </div>
            
            {/* Right Sidebar Ad */}
            <PDFNativeAd className="flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      {!isFullscreen && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-text-muted text-xs hidden lg:block pointer-events-none">
          <div className="bg-surface border border-border rounded-lg p-2 space-y-1">
            <div>F - Fullscreen</div>
            <div>Esc - Close</div>
            <div>Esc might not<br />if you have clicked inside PDF<br />Click outside to use Esc again</div>
          </div>
        </div>
      )}
    </div>
  );
}