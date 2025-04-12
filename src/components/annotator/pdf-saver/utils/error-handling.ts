'use client';

import { PDFSaveErrorCode, PDFSaveError } from '../types';

/**
 * Get a user-friendly error message for PDF save errors
 */
export function getErrorMessage(error: PDFSaveError): string {
  switch (error.code) {
    case PDFSaveErrorCode.INITIALIZATION_FAILED:
      return 'Failed to prepare the PDF for saving. Please try again.';
    
    case PDFSaveErrorCode.INVALID_ANNOTATIONS:
      return 'The annotations could not be processed. Please try again.';
    
    case PDFSaveErrorCode.SVG_GENERATION_FAILED:
      return 'Failed to generate annotations. Please try again.';
    
    case PDFSaveErrorCode.PDF_MODIFICATION_FAILED:
      return 'Failed to save annotations to PDF. Please try again.';
    
    case PDFSaveErrorCode.MEMORY_ERROR:
      return 'Not enough memory to process the PDF. Try with a smaller file.';
    
    case PDFSaveErrorCode.INVALID_PDF:
      return 'The PDF file appears to be corrupted or invalid.';
    
    case PDFSaveErrorCode.RENDERING_ERROR:
      return 'Failed to render annotations. Please try again.';
    
    default:
      return 'An unexpected error occurred while saving the PDF.';
  }
}

/**
 * Check if enough memory is available for PDF processing
 */
export function checkMemoryAvailability(estimatedSize: number): boolean {
  if (typeof performance === 'undefined' || !performance?.memory) {
    return true; // Can't check memory, assume it's okay
  }

  // @ts-ignore - memory is a non-standard Chrome property
  const memory = performance.memory;
  const available = memory.jsHeapSizeLimit - memory.usedJSHeapSize;
  const required = estimatedSize * 4; // Estimate: 4x size needed for processing

  return available > required;
}

/**
 * Check if an error is a PDF save error
 */
export function isPDFSaveError(error: any): error is PDFSaveError {
  return error instanceof PDFSaveError;
}

/**
 * Create a PDF save error from an unknown error
 */
export function createPDFSaveError(
  error: unknown, 
  code: PDFSaveErrorCode = PDFSaveErrorCode.UNKNOWN_ERROR
): PDFSaveError {
  if (error instanceof PDFSaveError) {
    return error;
  }

  return new PDFSaveError(
    code,
    error instanceof Error ? error.message : 'An unknown error occurred',
    error
  );
}

/**
 * Format error details for logging
 */
export function formatErrorDetails(error: Error): string {
  if (error instanceof PDFSaveError) {
    return `[${error.code}] ${error.message}${
      error.details ? `\nDetails: ${JSON.stringify(error.details)}` : ''
    }`;
  }
  
  return error.stack || error.message;
}

/**
 * Try to clean up memory after an error
 */
export function cleanupAfterError(): void {
  try {
    // Try to force garbage collection in debug builds
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  } catch (e) {
    // Ignore if gc is not available
  }
}