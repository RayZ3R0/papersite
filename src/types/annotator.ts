export interface ViewportState {
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  pageNumber: number;
  numPages: number;
}

export interface PDFPageInfo {
  width: number;        // Width in PDF points
  height: number;       // Height in PDF points
  userUnit: number;     // PDF user unit (scaling factor)
  viewportScale: number; // Initial viewport scale
  rotation: number;      // Page rotation
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type ToolType = 'pen' | 'highlighter' | 'eraser';

export interface ToolState {
  activeTool: ToolType;
  color: string;
  size: number;
  opacity: number;
}

export interface Stroke {
  id: string;
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  points: Point[];
}

export type Annotation = {
  type: 'stroke';
} & Stroke;

export interface AnnotationHistory {
  past: Annotation[][];
  future: Annotation[][];
}