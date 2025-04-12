'use client';

import { PDFSaverOptions } from './types';

export { default as CoordinateMapper } from './CoordinateMapper';
export { default as SVGGenerator } from './SVGGenerator';
export { default as PDFModifier } from './PDFModifier';
export * from './types';

// Re-export main PDFSaver for convenience
export { default } from '../PDFSaver';

// Export default config
export const DEFAULT_PDF_SAVER_OPTIONS: PDFSaverOptions = {
  chunkSize: 10,
  chunkDelay: 100,
  highQuality: true,
  optimizeMemory: true,
};