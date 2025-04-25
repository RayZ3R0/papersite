export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingTool {
  type: 'pen' | 'eraser';
  color?: string;
  width: number;
  opacity?: number;
}

export interface Path {
  id: string;
  tool: DrawingTool;
  points: Point[];
  timestamp: number;
}

export interface PageAnnotations {
  pageNumber: number;
  paths: Path[];
}

export interface Coordinate {
  viewportX: number;
  viewportY: number;
  pdfX: number;
  pdfY: number;
  scale: number;
}

export interface BaseAnnotationLayerProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  width: number;
  height: number;
  onAnnotationChange?: (annotations: PageAnnotations) => void;
}

export interface AnnotationLayerProps extends BaseAnnotationLayerProps {
  activeTool: DrawingTool;
}

export type Tool = 'pen' | 'eraser';

export interface ToolbarProps {
  activeTool: Tool;
  penColor: string;
  strokeWidth: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export interface PDFViewerProps {
  file: File | { url: string };
}