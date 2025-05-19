import React from "react";
import NativePDFViewer from "./NativePDFViewer";

interface PDFWrapperProps {
  url: string;
  width?: number; // Not used anymore but kept for API compatibility
  className?: string;
}

const PDFWrapper: React.FC<PDFWrapperProps> = ({ url, className }) => {
  return (
    <NativePDFViewer
      url={url}
      className={className}
    />
  );
};

export default PDFWrapper;
