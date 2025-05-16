import { PDFModifier } from '../PDFModifier';
import { PDFSaveErrorCode } from '../types';

describe('PDFModifier', () => {
  let modifier: PDFModifier;

  beforeEach(() => {
    modifier = new PDFModifier();
  });

  it('should throw error when PDF not loaded', async () => {
    await expect(modifier.save()).rejects.toThrow();
  });

  it('should throw initialization error when accessing page before loading', () => {
    expect(() => modifier.getPage(1)).toThrow();
  });

  it('should throw initialization error when getting page count before loading', () => {
    expect(() => modifier.getPageCount()).toThrow();
  });

  it('should load PDF successfully', async () => {
    const pdfBytes = new Uint8Array([/* mock PDF bytes */]);
    const doc = await modifier.loadPDF(pdfBytes.buffer);
    expect(doc).toBeDefined();
  });

  it('should embed image after loading PDF', async () => {
    const pdfBytes = new Uint8Array([/* mock PDF bytes */]);
    await modifier.loadPDF(pdfBytes.buffer);
    
    const imageBytes = new Uint8Array([/* mock PNG bytes */]);
    const result = await modifier.embedImage(imageBytes);
    expect(result).toBeDefined();
  });

  it('should throw error when embedding image before loading PDF', async () => {
    const imageBytes = new Uint8Array([/* mock PNG bytes */]);
    await expect(modifier.embedImage(imageBytes)).rejects.toThrow();
  });

  it('should save modified PDF', async () => {
    const pdfBytes = new Uint8Array([/* mock PDF bytes */]);
    await modifier.loadPDF(pdfBytes.buffer);
    const result = await modifier.save();
    expect(result).toBeDefined();
  });

  // Mock implementation tests
  it('should use correct error codes', async () => {
    try {
      await modifier.save();
    } catch (error: any) {
      expect(error.code).toBe(PDFSaveErrorCode.INITIALIZATION_FAILED);
    }
  });
});