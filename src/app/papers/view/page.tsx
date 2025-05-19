"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import PDFWrapper from "@/components/pdf/PDFWrapper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Script from "next/script";

interface ViewerControlsProps {
  currentView: "qp" | "ms" | "split";
  onViewChange: (view: "qp" | "ms" | "split") => void;
  qpUrl: string;
  msUrl: string;
  showSplitOption?: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onDownload: () => void;
}

const ViewerControls = ({ 
  currentView, 
  onViewChange, 
  qpUrl, 
  msUrl, 
  showSplitOption = true,
  onToggleFullscreen,
  isFullscreen,
  onDownload
}: ViewerControlsProps) => {
  return (
    <div className="fixed top-[56px] md:top-16 left-0 right-0 bg-surface/95 backdrop-blur-sm border-b border-border z-40 px-4 py-1 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center h-10">
        <div className="flex items-center space-x-1 flex-1">
          <div className="bg-surface-alt rounded-lg p-0.5 flex">
            <button
              onClick={() => onViewChange("qp")}
              className={`px-3 py-1 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                currentView === "qp"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text hover:bg-surface-alt/80"
              }`}
            >
              Question Paper
            </button>
            <button
              onClick={() => onViewChange("ms")}
              className={`px-3 py-1 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                currentView === "ms"
                  ? "bg-secondary text-white shadow-sm"
                  : "text-text hover:bg-surface-alt/80"
              }`}
            >
              Mark Scheme
            </button>
            {showSplitOption && (
              <button
                onClick={() => onViewChange("split")}
                className={`px-3 py-1 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                  currentView === "split"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text hover:bg-surface-alt/80"
                }`}
              >
                Split View
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onDownload}
            className="px-2 md:px-3 py-1 bg-surface-alt hover:bg-surface-alt/80 text-text rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-1.5"
            title="Download PDF (Ctrl+S)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden md:inline">{currentView === "split" ? "Download PDFs" : currentView === "ms" ? "Download MS" : "Download QP"}</span>
            <span className="md:hidden">Download</span>
          </button>
          
          <button
            onClick={onToggleFullscreen}
            className="hidden md:flex p-1 rounded-md bg-surface-alt hover:bg-surface-alt/80 text-text transition-all"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen (Ctrl+F)"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FloatingExitButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-[10000] bg-black/80 p-3 rounded-full shadow-lg hover:bg-black/90 transition-colors text-white border-2 border-white/80"
      aria-label="Exit fullscreen"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};

// Toast notification component for fullscreen mode
const FullscreenToast = () => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fullscreen-toast">
      <div className="toast-content">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Press <kbd>ESC</kbd> to exit fullscreen
      </div>
    </div>
  );
};

export default function PDFViewerPage() {
  const searchParams = useSearchParams();
  const isWideScreen = useMediaQuery("(min-width: 1024px)");
  
  // Get URLs from params and decode
  const pdfUrl = atob(searchParams.get("pdfUrl") || "");
  const msUrl = atob(searchParams.get("msUrl") || "");
  const initialView = (searchParams.get("type") || "qp") as "qp" | "ms" | "split";
  
  // Create hidden download links
  const qpDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const msDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  
  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  // State to show toast when entering fullscreen
  const [showFullscreenToast, setShowFullscreenToast] = useState(false);
  
  // Don't allow split view on narrow screens
  const [currentView, setCurrentView] = useState<"qp" | "ms" | "split">(
    !isWideScreen && initialView === "split" ? "qp" : initialView
  );

  // Switch to single view when screen becomes narrow
  useEffect(() => {
    if (!isWideScreen && currentView === "split") {
      setCurrentView("qp");
    }
  }, [isWideScreen, currentView]);

  // Download function that works across all browsers
  const handleDownload = () => {
    // Create temporary blob URLs to force download instead of navigation
    const downloadFile = (url: string, filename: string) => {
      // Fetch the file and create a blob URL
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.href = blobUrl;
          tempLink.download = filename;
          document.body.appendChild(tempLink);
          tempLink.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobUrl);
          }, 200);
        })
        .catch(err => {
          console.error("Download failed:", err);
        });
    };

    if (currentView === "qp" || currentView === "split") {
      downloadFile(pdfUrl, "question_paper.pdf");
    }
    
    if (currentView === "ms" || currentView === "split") {
      // Add slight delay when downloading both to prevent browser blocking
      if (currentView === "split") {
        setTimeout(() => {
          downloadFile(msUrl, "marking_scheme.pdf");
        }, 300);
      } else {
        downloadFile(msUrl, "marking_scheme.pdf");
      }
    }
  };

  // Handle keyboard shortcuts for downloading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Command+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        handleDownload();
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        // Add fullscreen shortcut (Ctrl+F or Command+F)
        e.preventDefault();
        if (isWideScreen) {
          handleToggleFullscreen();
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        // Exit fullscreen with Escape key
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, isFullscreen, isWideScreen]);

  // Listen for fullscreenchange event
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === null) {
        setIsFullscreen(false);
        setShowFullscreenToast(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (!fullscreenContainerRef.current) return;

    if (!isFullscreen) {
      try {
        if (fullscreenContainerRef.current.requestFullscreen) {
          await fullscreenContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
          setShowFullscreenToast(true);
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setShowFullscreenToast(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Script 
        src="/pdfjs/build/pdf.worker.js"
        strategy="beforeInteractive"
      />
      <Script 
        src="/pdfjs/build/pdf.js"
        strategy="beforeInteractive"
      />
      <Script 
        src="/pdfViewerController.js"
        strategy="beforeInteractive"
      />
      
      {/* Hidden download links to ensure cross-browser compatibility */}
      <a 
        ref={qpDownloadLinkRef}
        href={pdfUrl}
        download="question_paper.pdf"
        className="hidden"
        aria-hidden="true"
        data-testid="qp-download-link"
      />
      <a 
        ref={msDownloadLinkRef}
        href={msUrl}
        download="marking_scheme.pdf"
        className="hidden"
        aria-hidden="true"
        data-testid="ms-download-link"
      />
      
      <ViewerControls
        currentView={currentView}
        onViewChange={setCurrentView}
        qpUrl={pdfUrl}
        msUrl={msUrl}
        showSplitOption={isWideScreen}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onDownload={handleDownload}
      />

      <div 
        ref={fullscreenContainerRef}
        className={`w-full mx-auto px-2 ${
          currentView === "split" ? "lg:grid lg:grid-cols-2 lg:gap-2" : "max-w-[95%]"
        } ${isFullscreen ? "fullscreen-container" : ""} pt-[68px] md:pt-[78px]`}
      >
        {(currentView === "qp" || currentView === "split") && (
          <div className={`w-full bg-surface rounded-lg p-0.5 md:p-1 shadow-sm mb-2 lg:mb-0 ${isFullscreen ? "h-full flex items-center justify-center" : ""}`}>
            <PDFWrapper 
              url={pdfUrl}
              width="100%"
              className={`mx-auto ${isFullscreen ? "max-h-full" : ""}`}
            />
          </div>
        )}

        {(currentView === "ms" || currentView === "split") && (
          <div className={`w-full bg-surface rounded-lg p-0.5 md:p-1 shadow-sm ${isFullscreen ? "h-full flex items-center justify-center" : ""}`}>
            <PDFWrapper 
              url={msUrl}
              width="100%"
              className={`mx-auto ${isFullscreen ? "max-h-full" : ""}`}
            />
          </div>
        )}

        {isFullscreen && <FloatingExitButton onClick={handleToggleFullscreen} />}
        {isFullscreen && showFullscreenToast && <FullscreenToast />}
      </div>

      <style jsx global>{`
        .fullscreen-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100% !important;
          padding: 0.25rem !important;
          background-color: var(--background);
          z-index: 9999;
          display: flex;
          flex-direction: ${currentView === "split" ? "row" : "column"};
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding-top: 0 !important;
        }
        
        /* Make sure the floating exit button has higher z-index and stands out */
        button[aria-label="Exit fullscreen"] {
          z-index: 99999;
        }
        
        /* Hide controls in fullscreen mode */
        .fullscreen-container:fullscreen .fixed {
          display: none;
        }
        
        /* PDF viewer styling for fullscreen */
        .fullscreen-container .bg-surface {
          height: ${currentView === "split" ? "98vh" : "98vh"};
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Adjust max width of PDF in fullscreen mode */
        .fullscreen-container .mx-auto {
          max-width: 100%;
          height: 100%;
        }
        
        /* Toast notification styling */
        .fullscreen-toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          animation: fadeInOut 3s ease-in-out;
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.75);
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-size: 14px;
        }
        
        .toast-content kbd {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 2px 5px;
          margin: 0 4px;
          font-family: monospace;
          font-size: 12px;
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
      `}</style>
    </div>
  );
}