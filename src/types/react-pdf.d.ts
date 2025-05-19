declare module 'react-pdf' {
  import { ComponentType, ReactElement } from 'react';
  import * as pdfjsLib from 'pdfjs-dist';

  interface DocumentProps {
    file: string | { url: string };
    onLoadSuccess?: (pdf: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
    loading?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
  }

  interface PageProps {
    pageNumber: number;
    width?: number;
    rotate?: number;
    className?: string;
    loading?: React.ReactNode;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  export const pdfjs: typeof pdfjsLib;
}