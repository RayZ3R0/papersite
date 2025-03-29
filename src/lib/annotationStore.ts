'use client';

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

export interface ToolSettings {
  pen: {
    size: number;
    color: string;
    opacity: number;
  };
  highlighter: {
    size: number;
    color: string;
    opacity: number;
  };
  eraser: {
    size: number;
    opacity: number;
  };
}

export interface PageAnnotations {
  strokes: Stroke[];
  undoStack: Stroke[][];
  redoStack: Stroke[][];
}

const defaultSettings: ToolSettings = {
  pen: {
    size: 2,
    color: '#000000',
    opacity: 1
  },
  highlighter: {
    size: 12,
    color: '#ffeb3b',
    opacity: 0.3
  },
  eraser: {
    size: 20,
    opacity: 1
  }
};

class AnnotationStore {
  private annotations: Map<number, PageAnnotations>;
  private settings: ToolSettings;

  constructor() {
    this.annotations = new Map();
    this.settings = this.loadSettings();
  }

  private loadSettings(): ToolSettings {
    if (typeof window === 'undefined') return defaultSettings;

    try {
      const saved = localStorage.getItem('annotationToolSettings');
      if (!saved) return defaultSettings;

      const parsed = JSON.parse(saved);
      return {
        pen: { ...defaultSettings.pen, ...parsed.pen },
        highlighter: { ...defaultSettings.highlighter, ...parsed.highlighter },
        eraser: { ...defaultSettings.eraser, ...parsed.eraser }
      };
    } catch {
      return defaultSettings;
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('annotationToolSettings', JSON.stringify(this.settings));
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

  // Add a new stroke with optimized points
  addStroke(pageNumber: number, stroke: Stroke) {
    const page = this.getPage(pageNumber);

    // Optimize points to reduce data size and improve rendering
    if (stroke.points.length > 2) {
      const optimizedPoints: Point[] = [stroke.points[0]];
      let lastPoint = stroke.points[0];

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const dx = point.x - lastPoint.x;
        const dy = point.y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only add points that are far enough apart
        if (distance > (stroke.tool === 'pen' ? 2 : 4)) {
          optimizedPoints.push(point);
          lastPoint = point;
        }
      }

      // Always include the last point
      if (lastPoint !== stroke.points[stroke.points.length - 1]) {
        optimizedPoints.push(stroke.points[stroke.points.length - 1]);
      }

      stroke.points = optimizedPoints;
    }

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
  getToolSettings<T extends ToolType>(tool: T): typeof this.settings[T] {
    return this.settings[tool];
  }

  // Update tool settings
  updateToolSettings<T extends ToolType>(
    tool: T,
    updates: Partial<typeof this.settings[T]>
  ) {
    this.settings[tool] = {
      ...this.settings[tool],
      ...updates
    };
    this.saveSettings();
  }

  // Reset tool settings to defaults
  resetToolSettings() {
    this.settings = { ...defaultSettings };
    this.saveSettings();
  }
}

const annotationStore = new AnnotationStore();
export default annotationStore;