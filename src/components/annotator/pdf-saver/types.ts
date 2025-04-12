import { Stroke } from "@/lib/annotationStore";

/**
 * Progress information during PDF saving
 */
export interface SaveProgress {
  /** Current page being processed */
  currentPage: number;
  /** Total number of pages in the PDF */
  totalPages: number;
  /** Current status message */
  status: string;
}

/**
 * Configuration options for PDF saving
 */
export interface PDFSaverOptions {
  /** Size of stroke processing chunks (default: 10) */
  chunkSize?: number;
  /** Delay between chunks in ms (default: 100) */
  chunkDelay?: number;
  /** Enable high resolution output (default: true) */
  highQuality?: boolean;
  /** Enable memory optimization (default: true) */
  optimizeMemory?: boolean;
}

/**
 * Viewport dimensions with scale
 */
export interface ViewportDimensions {
  width: number;
  height: number;
  scale: number;
}

/**
 * PDF page dimensions
 */
export interface PDFDimensions {
  width: number;
  height: number;
}

/**
 * SVG generation options
 */
export interface SVGOptions {
  width: number;
  height: number;
  viewport: ViewportDimensions;
  optimizePaths?: boolean;
  preservePressure?: boolean;
}

/**
 * Interface for the PDFSaver class
 */
export interface IPDFSaver {
  save(
    annotations: Map<number, Stroke[]>,
    onProgress?: (progress: SaveProgress) => void,
    options?: PDFSaverOptions
  ): Promise<Blob>;
}

/**
 * Internal types for PDF processing
 */
interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

interface PDFProcessingContext {
  pageNumber: number;
  totalPages: number;
  dimensions: PDFDimensions;
  strokes: Stroke[];
}

/**
 * Error codes for PDF saving operations
 */
export enum PDFSaveErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  INVALID_ANNOTATIONS = 'INVALID_ANNOTATIONS',
  SVG_GENERATION_FAILED = 'SVG_GENERATION_FAILED',
  PDF_MODIFICATION_FAILED = 'PDF_MODIFICATION_FAILED',
  MEMORY_ERROR = 'MEMORY_ERROR',
  INVALID_PDF = 'INVALID_PDF',
  RENDERING_ERROR = 'RENDERING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for PDF saving operations
 */
export class PDFSaveError extends Error {
  constructor(
    public code: PDFSaveErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PDFSaveError';
  }
}

/**
 * Error handler type
 */
export type ErrorHandler = (error: Error, context?: any) => void;

/**
 * Point in PDF coordinates
 */
export interface PDFPoint {
  x: number;
  y: number;
  pressure?: number;
  pdfX: number;
  pdfY: number;
}