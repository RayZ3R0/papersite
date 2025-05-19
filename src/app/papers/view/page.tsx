"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PDFWrapper from "@/components/pdf/PDFWrapper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Script from "next/script";

interface ViewerControlsProps {
  currentView: "qp" | "ms" | "split";
  onViewChange: (view: "qp" | "ms" | "split") => void;
  qpUrl: string;
  msUrl: string;
  showSplitOption?: boolean;
}

const ViewerControls = ({ currentView, onViewChange, qpUrl, msUrl, showSplitOption = true }: ViewerControlsProps) => {
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

export default function PDFViewerPage() {
  const searchParams = useSearchParams();
  const isWideScreen = useMediaQuery("(min-width: 1024px)");
  
  // Get URLs from params and decode
  const pdfUrl = atob(searchParams.get("pdfUrl") || "");
  const msUrl = atob(searchParams.get("msUrl") || "");
  const initialView = (searchParams.get("type") || "qp") as "qp" | "ms" | "split";
  
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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Command+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        
        if (currentView === "split") {
          // For split view, download both files
          // We need to download them one by one using a slight delay
          downloadFile(pdfUrl, "question_paper.pdf");
          setTimeout(() => {
            downloadFile(msUrl, "marking_scheme.pdf");
          }, 100);
        } else if (currentView === "qp") {
          downloadFile(pdfUrl, "question_paper.pdf");
        } else {
          downloadFile(msUrl, "marking_scheme.pdf");
        }
      }
    };

    // Function to trigger file download
    const downloadFile = (url: string, filename: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, pdfUrl, msUrl]);

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
      />

      <div className={`max-w-7xl mx-auto px-4 ${
        currentView === "split" ? "lg:grid lg:grid-cols-2 lg:gap-4" : ""
      }`}>
        {(currentView === "qp" || currentView === "split") && (
          <div className="w-full bg-surface rounded-lg p-2 md:p-4 shadow-sm mb-4 lg:mb-0">
            <PDFWrapper 
              url={pdfUrl}
              width={currentView === "split" ? 400 : 800}
              className="mx-auto"
            />
          </div>
        )}

        {(currentView === "ms" || currentView === "split") && (
          <div className="w-full bg-surface rounded-lg p-2 md:p-4 shadow-sm">
            <PDFWrapper 
              url={msUrl}
              width={currentView === "split" ? 400 : 800}
              className="mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}