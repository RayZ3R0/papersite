import { PDFDocument } from 'pdf-lib';
import { PDFSaveErrorCode, PDFSaveError } from './types';

export class PDFModifier {
  private pdfDoc: PDFDocument | null = null;

  constructor() {
    this.pdfDoc = null;
  }

  async loadPDF(pdfBytes: ArrayBuffer) {
    try {
      this.pdfDoc = await PDFDocument.load(pdfBytes);
      return this.pdfDoc;
    } catch (error) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INITIALIZATION_FAILED,
        'Failed to load PDF'
      );
    }
  }

  async embedImage(imageBytes: Uint8Array) {
    if (!this.pdfDoc) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INITIALIZATION_FAILED,
        'PDF document not loaded'
      );
    }

    try {
      const image = await this.pdfDoc.embedPng(imageBytes);
      return image;
    } catch (error) {
      throw new PDFSaveError(
        PDFSaveErrorCode.PDF_MODIFICATION_FAILED,
        'Failed to embed image in PDF'
      );
    }
  }

  getPage(pageNumber: number) {
    if (!this.pdfDoc) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INITIALIZATION_FAILED,
        'PDF document not loaded'
      );
    }

    const pages = this.pdfDoc.getPages();
    const page = pages[pageNumber - 1];

    if (!page) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INVALID_PDF,
        `Page ${pageNumber} not found`
      );
    }

    return page;
  }

  getPageCount(): number {
    if (!this.pdfDoc) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INITIALIZATION_FAILED,
        'PDF document not loaded'
      );
    }

    return this.pdfDoc.getPageCount();
  }

  async save() {
    if (!this.pdfDoc) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INITIALIZATION_FAILED,
        'PDF document not loaded'
      );
    }

    try {
      return await this.pdfDoc.save({
        useObjectStreams: false
      });
    } catch (error) {
      throw new PDFSaveError(
        PDFSaveErrorCode.PDF_MODIFICATION_FAILED,
        'Failed to save PDF'
      );
    }
  }

  // Process method for testing
  async process() {
    if (!this.pdfDoc) {
      throw new PDFSaveError(
        PDFSaveErrorCode.INITIALIZATION_FAILED,
        'PDF document not loaded'
      );
    }
    return await this.save();
  }
}

export default PDFModifier;