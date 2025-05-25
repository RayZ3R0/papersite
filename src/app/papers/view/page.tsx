"use client";

import { useEffect, useState, useRef } from "react";
import PDFWrapper from "@/components/pdf/PDFWrapper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Script from "next/script";
import dynamic from "next/dynamic";

// Lazy load DataBooklet component
const DataBooklet = dynamic(
  () => import("@/components/data-booklet/DataBooklet"),
  { ssr: false, loading: () => null }
);

interface ViewData {
  type: "qp" | "ms" | "split";
  pdfUrl: string;
  msUrl: string;
  subject: string;
  unit: string;
  session: string;
  year: number;
  unitCode: string;
}

interface ViewerControlsProps {
  currentView: "qp" | "ms" | "split";
  onViewChange: (view: "qp" | "ms" | "split") => void;
  qpUrl: string;
  msUrl: string;
  showSplitOption?: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onDownload: () => void;
  hasQP: boolean;
  hasMSS: boolean;
}

const ViewerControls = ({ 
  currentView, 
  onViewChange, 
  qpUrl, 
  msUrl, 
  showSplitOption = true,
  onToggleFullscreen,
  isFullscreen,
  onDownload,
  hasQP,
  hasMSS
}: ViewerControlsProps) => {
  return (
    <div className="fixed top-[56px] md:top-16 left-0 right-0 bg-surface/95 backdrop-blur-sm border-b border-border z-40 px-4 py-1 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center h-10">
        <div className="flex items-center space-x-1 flex-1">
          <div className="bg-surface-alt rounded-lg p-0.5 flex">
            {hasQP && (
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
            )}
            {hasMSS && (
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
            )}
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
  const isWideScreen = useMediaQuery("(min-width: 1024px)");
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const qpDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  const msDownloadLinkRef = useRef<HTMLAnchorElement>(null);
  
  // State management
  const [viewData, setViewData] = useState<ViewData | null>(null);
  const [currentView, setCurrentView] = useState<"qp" | "ms" | "split">("qp");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenToast, setShowFullscreenToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse data from hash - use useEffect to avoid hydration issues
  useEffect(() => {
    const parseHashData = (): ViewData | null => {
      try {
        const hash = window.location.hash.slice(1); // Remove the #
        if (hash) {
          const decoded = JSON.parse(atob(hash));
          return decoded as ViewData;
        }
      } catch (error) {
        console.error("Failed to parse view data from hash:", error);
        
        // Fallback to old method using URLSearchParams for backward compatibility
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const fallbackData: ViewData = {
            type: (searchParams.get("type") as "qp" | "ms" | "split") || "qp",
            pdfUrl: searchParams.get("pdfUrl") || "",
            msUrl: searchParams.get("msUrl") || "",
            subject: "unknown",
            unit: "unknown", 
            session: "unknown",
            year: new Date().getFullYear(),
            unitCode: "unknown"
          };
          return fallbackData;
        } catch (fallbackError) {
          console.error("Failed to parse fallback data:", fallbackError);
        }
      }
      return null;
    };
    
    const data = parseHashData();
    if (data) {
      setViewData(data);
      setCurrentView(data.type || "qp");
    }
    setIsLoading(false);
    
    // Listen for hash changes (for navigation within the app)
    const handleHashChange = () => {
      const newData = parseHashData();
      if (newData) {
        setViewData(newData);
        setCurrentView(newData.type || "qp");
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Derived values - these are computed from viewData, so they won't cause hook order issues
  const pdfUrl = viewData ? atob(viewData.pdfUrl || "") : "";
  const msUrl = viewData ? atob(viewData.msUrl || "") : "";
  const hasQP = Boolean(pdfUrl && pdfUrl.trim() && pdfUrl !== "/nopaper");
  const hasMSS = Boolean(msUrl && msUrl.trim() && msUrl !== "/nopaper");
  const canShowSplit = hasQP && hasMSS && isWideScreen;
  
  // Validate and adjust current view based on available files
  useEffect(() => {
    if (!viewData) return;
    
    // Determine valid view based on availability
    const getValidView = (desiredView: "qp" | "ms" | "split"): "qp" | "ms" | "split" => {
      if (desiredView === "split" && !canShowSplit) {
        return hasQP ? "qp" : "ms";
      }
      if (desiredView === "qp" && !hasQP) {
        return "ms";
      }
      if (desiredView === "ms" && !hasMSS) {
        return "qp";
      }
      return desiredView;
    };
    
    const validView = getValidView(currentView);
    if (validView !== currentView) {
      setCurrentView(validView);
    }
  }, [currentView, hasQP, hasMSS, canShowSplit, viewData]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Command+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleDownload();
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isWideScreen) {
          handleToggleFullscreen();
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isFullscreen, isWideScreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === null) {
        setIsFullscreen(false);
        setShowFullscreenToast(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Download function
  const handleDownload = () => {
    const getFilenameFromUrl = (url: string): string => {
      try {
        const urlPath = new URL(url).pathname;
        const fileName = urlPath.split('/').pop();
        
        if (fileName && fileName.endsWith('.pdf')) {
          return decodeURIComponent(fileName);
        }
        return urlPath.includes('ms') ? "marking_scheme.pdf" : "question_paper.pdf";
      } catch (e) {
        return url.includes('ms') ? "marking_scheme.pdf" : "question_paper.pdf";
      }
    };

    const downloadFile = (url: string) => {
      const filename = getFilenameFromUrl(url);
      
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.href = blobUrl;
          tempLink.download = filename;
          document.body.appendChild(tempLink);
          tempLink.click();
          
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
      downloadFile(pdfUrl);
    }
    
    if (currentView === "ms" || currentView === "split") {
      if (currentView === "split") {
        setTimeout(() => {
          downloadFile(msUrl);
        }, 300);
      } else {
        downloadFile(msUrl);
      }
    }
  };

  // Fullscreen toggle
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state - no data found
  if (!viewData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-text mb-2">No Paper Data Found</h2>
          <p className="text-text-muted mb-4">
            The paper data could not be loaded. This might happen if you accessed this page directly or if the link is invalid.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
      
      {/* Hidden download links */}
      <a 
        ref={qpDownloadLinkRef}
        href={pdfUrl}
        download={pdfUrl.split('/').pop() || "question_paper.pdf"}
        className="hidden"
        aria-hidden="true"
        data-testid="qp-download-link"
      />
      <a 
        ref={msDownloadLinkRef}
        href={msUrl}
        download={msUrl.split('/').pop() || "marking_scheme.pdf"}
        className="hidden"
        aria-hidden="true"
        data-testid="ms-download-link"
      />
      
      {/* Data Booklet/Formula Book - Only for chemistry and mathematics */}
      {viewData && (viewData.subject === 'chemistry' || viewData.subject === 'mathematics') && (
        <DataBooklet subject={viewData.subject} />
      )}
      
      <ViewerControls
        currentView={currentView}
        onViewChange={setCurrentView}
        qpUrl={pdfUrl}
        msUrl={msUrl}
        showSplitOption={canShowSplit}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onDownload={handleDownload}
        hasQP={hasQP}
        hasMSS={hasMSS}
      />

      <div 
        ref={fullscreenContainerRef}
        className={`w-full mx-auto px-2 
          ${currentView === "split" ? "lg:grid lg:grid-cols-2 lg:gap-2" : "max-w-[95%]"}
          ${isFullscreen ? "fullscreen-container" : ""} 
          pt-[108px] md:pt-[118px]`
        }
      >
        {/* Question Paper container */}
        <div 
          className={`w-full bg-surface rounded-lg p-0.5 md:p-1 shadow-sm mb-2 lg:mb-0 
            ${isFullscreen ? "h-full flex items-center justify-center" : ""}
            ${currentView === "qp" || currentView === "split" ? "block" : "hidden"}`
          }
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <div className={`w-full h-full ${currentView === "qp" || currentView === "split" ? "" : "invisible"}`}>
            <PDFWrapper 
              url={pdfUrl}
              width="100%"
              className={`mx-auto ${isFullscreen ? "max-h-full" : ""}`}
            />
          </div>
        </div>

        {/* Mark Scheme container */}
        <div 
          className={`w-full bg-surface rounded-lg p-0.5 md:p-1 shadow-sm 
            ${isFullscreen ? "h-full flex items-center justify-center" : ""}
            ${currentView === "ms" || currentView === "split" ? "block" : "hidden"}`
          }
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <div className={`w-full h-full ${currentView === "ms" || currentView === "split" ? "" : "invisible"}`}>
            <PDFWrapper 
              url={msUrl}
              width="100%"
              className={`mx-auto ${isFullscreen ? "max-h-full" : ""}`}
            />
          </div>
        </div>

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
        
        button[aria-label="Exit fullscreen"] {
          z-index: 99999;
        }
        
        .fullscreen-container:fullscreen .fixed {
          display: none;
        }
        
        .fullscreen-container .bg-surface {
          height: 98vh;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fullscreen-container .bg-surface {
          width: ${currentView === "split" ? "50%" : "100%"} !important;
          flex: ${currentView === "split" ? "1" : "none"};
        }
        
        .fullscreen-container .bg-surface[style*="display: none"] {
          display: none !important;
        }
        
        ${currentView === "qp" && isFullscreen ? `
          .fullscreen-container .bg-surface:nth-child(2) {
            display: none !important;
          }
        ` : ""}
        
        ${currentView === "ms" && isFullscreen ? `
          .fullscreen-container .bg-surface:nth-child(1) {
            display: none !important;
          }
        ` : ""}
        
        .fullscreen-container .mx-auto {
          max-width: 100%;
          height: 100%;
        }
        
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