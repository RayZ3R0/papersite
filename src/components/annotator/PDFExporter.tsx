import { PDFDocument, rgb } from 'pdf-lib';
import type { Annotation, Stroke, Point, PDFPageInfo } from '@/types/annotator';

type ProgressCallback = (progress: number) => void;

export default class PDFExporter {
  private file: File;
  private pdfPageInfo: Record<number, PDFPageInfo>;
  private annotations: Record<number, Annotation[]>;
  
  constructor(
    file: File, 
    pdfPageInfo: Record<number, PDFPageInfo>,
    annotations: Record<number, Annotation[]>
  ) {
    this.file = file;
    this.pdfPageInfo = pdfPageInfo;
    this.annotations = annotations;
  }
  
  private parseColor(color: string): { r: number, g: number, b: number } {
    let r = 0, g = 0, b = 0;
    try {
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        r = parseInt(hex.slice(0, 2), 16) / 255;
        g = parseInt(hex.slice(2, 4), 16) / 255;
        b = parseInt(hex.slice(4, 6), 16) / 255;
      }
    } catch (e) {
      console.error('Color parsing error:', e);
    }
    return { r, g, b };
  }
  
  private async drawStrokeToPDF(
    pdfPage: any, 
    stroke: Stroke,
    pageInfo: PDFPageInfo
  ) {
    // Skip strokes with less than 2 points
    if (stroke.points.length < 2) return;
    
    // Parse color
    const { r, g, b } = this.parseColor(stroke.color);
    
    // Calculate PDF thickness
    // PDF page dimensions are in points (1/72 inch), so scale appropriately
    const pdfScale = pageInfo.userUnit || 1;
    const thicknessInPoints = stroke.size * pdfScale;
    
    // For smoother curves, we'll draw segments between points
    if (stroke.tool === 'eraser') {
      // White out for eraser (simulating erasure)
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const start = stroke.points[i];
        const end = stroke.points[i + 1];
        
        pdfPage.drawLine({
          start: { x: start.x, y: pageInfo.height - start.y }, // PDF y-axis is inverted
          end: { x: end.x, y: pageInfo.height - end.y },
          thickness: thicknessInPoints,
          color: rgb(1, 1, 1), // White
          opacity: 1
        });
      }
    } 
    else if (stroke.tool === 'highlighter') {
      // Highlighter with translucent effect
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const start = stroke.points[i];
        const end = stroke.points[i + 1];
        
        pdfPage.drawLine({
          start: { x: start.x, y: pageInfo.height - start.y },
          end: { x: end.x, y: pageInfo.height - end.y },
          thickness: thicknessInPoints * 1.5, // Make highlighter thicker
          color: rgb(r, g, b),
          opacity: Math.min(0.4, stroke.opacity) // Cap highlighter opacity
        });
      }
    } 
    else {
      // Regular pen with smooth line
      for (let i = 0; i < stroke.points.length - 1; i++) {
        const start = stroke.points[i];
        const end = stroke.points[i + 1];
        
        pdfPage.drawLine({
          start: { x: start.x, y: pageInfo.height - start.y },
          end: { x: end.x, y: pageInfo.height - end.y },
          thickness: thicknessInPoints,
          color: rgb(r, g, b),
          opacity: stroke.opacity
        });
      }
    }
  }
  
  public async export(progressCallback?: ProgressCallback): Promise<Blob> {
    try {
      // Report initial progress
      if (progressCallback) progressCallback(0.1);
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await this.file.arrayBuffer();
      
      // Load the PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      if (progressCallback) progressCallback(0.3);
      
      // Count total operations for progress tracking
      let totalOperations = 0;
      for (const pageNumberStr in this.annotations) {
        totalOperations += this.annotations[pageNumberStr].length;
      }
      let completedOperations = 0;
      
      // For each page with annotations
      for (const [pageNumberStr, pageAnnotations] of Object.entries(this.annotations)) {
        const pageNumber = parseInt(pageNumberStr, 10);
        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pages.length) {
          console.warn(`Invalid page number: ${pageNumberStr}`);
          continue;
        }
        
        // Get page info and PDF page
        const pageInfo = this.pdfPageInfo[pageNumber];
        if (!pageInfo) {
          console.warn(`Missing page info for page ${pageNumber}`);
          continue;
        }
        
        // PDF pages are 0-indexed
        const pdfPage = pages[pageNumber - 1];
        
        console.log(`Drawing annotations on page ${pageNumber}:`, {
          pageInfo,
          pdfSize: { width: pdfPage.getWidth(), height: pdfPage.getHeight() }
        });
        
        // Draw each annotation
        for (const annotation of pageAnnotations) {
          if (annotation.type === 'stroke') {
            await this.drawStrokeToPDF(pdfPage, annotation, pageInfo);
          }
          
          // Update progress
          completedOperations++;
          if (progressCallback && totalOperations > 0) {
            const progress = 0.3 + (0.6 * (completedOperations / totalOperations));
            progressCallback(progress);
          }
        }
      }
      
      // Serialize the PDF
      const pdfBytes = await pdfDoc.save();
      
      if (progressCallback) progressCallback(1);
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }
}