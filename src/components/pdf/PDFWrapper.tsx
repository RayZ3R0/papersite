import { useState, useEffect, useRef } from "react";
import NativePDFViewer from "./NativePDFViewer";
import PDFControls from "./PDFControls";
import KeyboardShortcuts from "./KeyboardShortcuts";

interface PDFWrapperProps {
  url: string;
  width?: number;
  className?: string;
}

interface PDFControlsState {
  scale: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
}

export default function PDFWrapper({ url, width = 800, className }: PDFWrapperProps) {
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [pdfState, setPdfState] = useState<PDFControlsState>({
    scale: 1,
    rotation: 0,
    currentPage: 1,
    totalPages: 0
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      let shouldPreventDefault = true;

      switch (e.key) {
        case "=":
        case "+":
          if (e.ctrlKey) {
            e.preventDefault();
            setPdfState(prev => {
              const newScale = Math.min(prev.scale + 0.25, 5);
              iframe.contentWindow?.postMessage({ type: "setZoom", scale: newScale }, "*");
              return { ...prev, scale: newScale };
            });
          }
          break;

        case "-":
          if (e.ctrlKey) {
            e.preventDefault();
            setPdfState(prev => {
              const newScale = Math.max(prev.scale - 0.25, 0.5);
              iframe.contentWindow?.postMessage({ type: "setZoom", scale: newScale }, "*");
              return { ...prev, scale: newScale };
            });
          }
          break;

        case "ArrowRight":
          setPdfState(prev => {
            const newPage = Math.min(prev.currentPage + 1, prev.totalPages);
            iframe.contentWindow?.postMessage({ type: "goToPage", page: newPage }, "*");
            return { ...prev, currentPage: newPage };
          });
          break;

        case "ArrowLeft":
          setPdfState(prev => {
            const newPage = Math.max(prev.currentPage - 1, 1);
            iframe.contentWindow?.postMessage({ type: "goToPage", page: newPage }, "*");
            return { ...prev, currentPage: newPage };
          });
          break;

        case "r":
        case "R":
          if (e.shiftKey) {
            setPdfState(prev => {
              const newRotation = (prev.rotation - 90 + 360) % 360;
              iframe.contentWindow?.postMessage({ type: "setRotation", rotation: newRotation }, "*");
              return { ...prev, rotation: newRotation };
            });
          } else {
            setPdfState(prev => {
              const newRotation = (prev.rotation + 90) % 360;
              iframe.contentWindow?.postMessage({ type: "setRotation", rotation: newRotation }, "*");
              return { ...prev, rotation: newRotation };
            });
          }
          break;

        case "/":
          setShowShortcuts(true);
          break;

        case "Escape":
          setShowShortcuts(false);
          break;

        default:
          shouldPreventDefault = false;
      }

      if (shouldPreventDefault) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object') {
        switch (e.data.type) {
          case "totalPages":
            setPdfState(prev => ({ ...prev, totalPages: e.data.pages }));
            break;
          case "currentPage":
            setPdfState(prev => ({ ...prev, currentPage: e.data.page }));
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (error) {
    return (
      <div className="w-full bg-surface rounded-lg p-4">
        <div className="text-center text-text-muted">
          <p>Failed to load PDF</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PDFControls
        scale={pdfState.scale}
        rotation={pdfState.rotation}
        onZoomIn={() => {
          setPdfState(prev => {
            const newScale = Math.min(prev.scale + 0.25, 5);
            iframeRef.current?.contentWindow?.postMessage({ type: "setZoom", scale: newScale }, "*");
            return { ...prev, scale: newScale };
          });
        }}
        onZoomOut={() => {
          setPdfState(prev => {
            const newScale = Math.max(prev.scale - 0.25, 0.5);
            iframeRef.current?.contentWindow?.postMessage({ type: "setZoom", scale: newScale }, "*");
            return { ...prev, scale: newScale };
          });
        }}
        onRotateClockwise={() => {
          setPdfState(prev => {
            const newRotation = (prev.rotation + 90) % 360;
            iframeRef.current?.contentWindow?.postMessage({ type: "setRotation", rotation: newRotation }, "*");
            return { ...prev, rotation: newRotation };
          });
        }}
        onRotateCounterClockwise={() => {
          setPdfState(prev => {
            const newRotation = (prev.rotation - 90 + 360) % 360;
            iframeRef.current?.contentWindow?.postMessage({ type: "setRotation", rotation: newRotation }, "*");
            return { ...prev, rotation: newRotation };
          });
        }}
        currentPage={pdfState.currentPage}
        totalPages={pdfState.totalPages}
        onPageChange={(page) => {
          setPdfState(prev => {
            iframeRef.current?.contentWindow?.postMessage({ type: "goToPage", page }, "*");
            return { ...prev, currentPage: page };
          });
        }}
        showShortcuts={showShortcuts}
        onToggleShortcuts={() => setShowShortcuts(prev => !prev)}
      />
      
      <NativePDFViewer
        url={url}
        width={width}
        className={className}
        onLoadSuccess={() => {
          iframeRef.current?.contentWindow?.postMessage({ type: "getTotalPages" }, "*");
        }}
        onLoadError={(err) => setError(err.message)}
      />
      
      {showShortcuts && <KeyboardShortcuts />}
    </div>
  );
}
