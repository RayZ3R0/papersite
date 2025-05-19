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
}

const ViewerControls = ({ 
  currentView, 
  onViewChange, 
  qpUrl, 
  msUrl, 
  showSplitOption = true,
  onToggleFullscreen,
  isFullscreen 
}: ViewerControlsProps) => {
  return (
    <div className="fixed top-16 left-0 right-0 bg-surface border-b border-border z-50 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
          <button
            onClick={() => onViewChange("qp")}
            className={`px-4 py-2 rounded-lg ${
              currentView === "qp"
                ? "bg-primary text-white"
                : "bg-surface-alt text-text hover:opacity-90"
            }`}
          >
            Question Paper
          </button>
          <button
            onClick={() => onViewChange("ms")}
            className={`px-4 py-2 rounded-lg ${
              currentView === "ms"
                ? "bg-secondary text-white"
                : "bg-surface-alt text-text hover:opacity-90"
            }`}
          >
            Mark Scheme
          </button>
          {showSplitOption && (
            <button
              onClick={() => onViewChange("split")}
              className={`px-4 py-2 rounded-lg ${
                currentView === "split"
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text hover:opacity-90"
              }`}
            >
              Split View
            </button>
          )}
          <button
            onClick={onToggleFullscreen}
            className="px-4 py-2 rounded-lg bg-surface-alt text-text hover:opacity-90 flex items-center justify-center gap-2"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <a 
            href={currentView === "ms" ? msUrl : qpUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={currentView === "ms" ? "marking_scheme.pdf" : "question_paper.pdf"}
            className="w-full md:w-auto mt-2 md:mt-0 px-4 py-2 bg-surface-alt text-text hover:opacity-90 rounded-lg flex items-center justify-center gap-2"
            id="primary-download-btn"
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
            Download {currentView === "split" ? "QP" : currentView === "ms" ? "MS" : "QP"}
          </a>
          {currentView === "split" && (
            <a 
              href={msUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="marking_scheme.pdf"
              className="w-full md:w-auto mt-2 md:mt-0 px-4 py-2 bg-surface-alt text-text hover:opacity-90 rounded-lg flex items-center justify-center gap-2"
              id="secondary-download-btn"
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
              Download MS
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const FloatingExitButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-[10000] bg-surface p-3 rounded-full shadow-lg hover:bg-surface-alt transition-colors"
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
  
  // Create refs for the download buttons
  const primaryDownloadBtnRef = useRef<HTMLAnchorElement>(null);
  const secondaryDownloadBtnRef = useRef<HTMLAnchorElement>(null);
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

  // Handle keyboard shortcuts for downloading
  useEffect(() => {
    // Update the refs to the current buttons after render
    const primaryBtn = document.getElementById("primary-download-btn") as HTMLAnchorElement;
    const secondaryBtn = document.getElementById("secondary-download-btn") as HTMLAnchorElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Command+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        
        // Click the appropriate download button(s)
        if (currentView === "split" && primaryBtn && secondaryBtn) {
          // For split view, trigger both download buttons
          primaryBtn.click();
          
          // Use setTimeout to make sure the first download starts before triggering the second
          setTimeout(() => {
            secondaryBtn.click();
          }, 300);
        } else if (primaryBtn) {
          // For single view, just click the primary download button
          primaryBtn.click();
        }
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        // Add fullscreen shortcut (Ctrl+F or Command+F)
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        // Exit fullscreen with Escape key
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, isFullscreen]);

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
    <div className="min-h-screen bg-background pt-28">
      <Script 
        src="/pdfjs/build/pdf.worker.js"
        strategy="beforeInteractive"
      />
      <Script 
        src="/pdfjs/build/pdf.js"
        strategy="beforeInteractive"
      />
      <ViewerControls
        currentView={currentView}
        onViewChange={setCurrentView}
        qpUrl={pdfUrl}
        msUrl={msUrl}
        showSplitOption={isWideScreen}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      <div 
        ref={fullscreenContainerRef}
        className={`max-w-7xl mx-auto px-4 ${
          currentView === "split" ? "lg:grid lg:grid-cols-2 lg:gap-4" : ""
        } ${isFullscreen ? "fullscreen-container" : ""}`}
      >
        {(currentView === "qp" || currentView === "split") && (
          <div className={`w-full bg-surface rounded-lg p-1 md:p-2 shadow-sm mb-4 lg:mb-0 ${isFullscreen ? "h-full flex items-center justify-center" : ""}`}>
            <PDFWrapper 
              url={pdfUrl}
              width={currentView === "split" ? 400 : 800}
              className={`mx-auto ${isFullscreen ? "max-h-full" : ""}`}
            />
          </div>
        )}

        {(currentView === "ms" || currentView === "split") && (
          <div className={`w-full bg-surface rounded-lg p-1 md:p-2 shadow-sm ${isFullscreen ? "h-full flex items-center justify-center" : ""}`}>
            <PDFWrapper 
              url={msUrl}
              width={currentView === "split" ? 400 : 800}
              className={`mx-auto ${isFullscreen ? "max-h-full" : ""}`}
            />
          </div>
        )}

        {isFullscreen && <FloatingExitButton onClick={handleToggleFullscreen} />}
        {isFullscreen && showFullscreenToast && <FullscreenToast />}
      </div>

      {/* Add some CSS for fullscreen mode */}
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