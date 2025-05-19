import React from 'react';

interface NativePDFViewerProps {
  url: string;
  className?: string;
}

const NativePDFViewer: React.FC<NativePDFViewerProps> = ({
  url,
  className
}) => {
  return (
    <div className={`w-full h-[calc(100vh-12rem)] ${className || ''}`}>
      <iframe
        src={`${url}#toolbar=0`}
        className="w-full h-full rounded-lg"
        style={{
          border: 'none',
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
};

export default NativePDFViewer;
