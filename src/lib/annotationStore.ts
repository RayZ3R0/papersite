export type ToolType = 'pen' | 'highlighter' | 'eraser';

export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  tool: ToolType;
}

export interface PageAnnotations {
  strokes: Stroke[];
  undoStack: Stroke[][];
  redoStack: Stroke[][];
}

class AnnotationStore {
  private annotations: Map<number, PageAnnotations>;

  constructor() {
    this.annotations = new Map();
  }

  private initializePage(pageNumber: number) {
    if (!this.annotations.has(pageNumber)) {
      this.annotations.set(pageNumber, {
        strokes: [],
        undoStack: [],
        redoStack: []
      });
    }
  }

  private getPage(pageNumber: number): PageAnnotations {
    this.initializePage(pageNumber);
    return this.annotations.get(pageNumber)!;
  }

  // Add a new stroke
  addStroke(pageNumber: number, stroke: Stroke) {
    const page = this.getPage(pageNumber);

    // Save current state to undo stack
    page.undoStack.push([...page.strokes]);
    
    // Add new stroke
    page.strokes.push(stroke);
    
    // Clear redo stack
    page.redoStack = [];
  }

  // Get all strokes for a page
  getStrokes(pageNumber: number): Stroke[] {
    return this.getPage(pageNumber).strokes;
  }

  // Undo last action
  undo(pageNumber: number): boolean {
    const page = this.getPage(pageNumber);
    
    if (page.undoStack.length === 0) return false;

    // Save current state to redo stack
    page.redoStack.push([...page.strokes]);
    
    // Restore previous state
    page.strokes = page.undoStack.pop()!;
    
    return true;
  }

  // Redo last undone action
  redo(pageNumber: number): boolean {
    const page = this.getPage(pageNumber);
    
    if (page.redoStack.length === 0) return false;

    // Save current state to undo stack
    page.undoStack.push([...page.strokes]);
    
    // Restore next state
    page.strokes = page.redoStack.pop()!;
    
    return true;
  }

  // Clear current page
  clearPage(pageNumber: number) {
    const page = this.getPage(pageNumber);
    
    if (page.strokes.length > 0) {
      // Save current state to undo stack
      page.undoStack.push([...page.strokes]);
      page.strokes = [];
      page.redoStack = [];
    }
  }

  // Check if undo is available
  canUndo(pageNumber: number): boolean {
    return (this.getPage(pageNumber).undoStack.length > 0);
  }

  // Check if redo is available
  canRedo(pageNumber: number): boolean {
    return (this.getPage(pageNumber).redoStack.length > 0);
  }

  // Get tool settings
  getToolSettings(tool: ToolType): { size: number; opacity: number; } {
    switch (tool) {
      case 'pen':
        return { size: 2, opacity: 1 };
      case 'highlighter':
        return { size: 20, opacity: 0.3 };
      case 'eraser':
        return { size: 20, opacity: 1 };
      default:
        return { size: 2, opacity: 1 };
    }
  }

  // Update tool settings (to be implemented)
  updateToolSettings(tool: ToolType, settings: { size?: number; opacity?: number }) {
    // TODO: Implement tool settings persistence
  }
}

const annotationStore = new AnnotationStore();
export default annotationStore;