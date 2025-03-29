export interface Stroke {
  points: { x: number; y: number; pressure: number }[];
  color: string;
  size: number;
}

export interface PageAnnotations {
  strokes: Stroke[];
}

class AnnotationStore {
  private annotations: Map<number, PageAnnotations>;

  constructor() {
    this.annotations = new Map();
  }

  // Initialize a page's annotations if they don't exist
  initializePage(pageNumber: number) {
    if (!this.annotations.has(pageNumber)) {
      this.annotations.set(pageNumber, { strokes: [] });
    }
  }

  // Add a new stroke to a page
  addStroke(pageNumber: number, stroke: Stroke) {
    this.initializePage(pageNumber);
    const pageAnnotations = this.annotations.get(pageNumber)!;
    pageAnnotations.strokes.push(stroke);
  }

  // Get all strokes for a page
  getStrokes(pageNumber: number): Stroke[] {
    return this.annotations.get(pageNumber)?.strokes || [];
  }

  // Clear all strokes for a page
  clearPage(pageNumber: number) {
    this.annotations.set(pageNumber, { strokes: [] });
  }

  // Clear all annotations
  clearAll() {
    this.annotations.clear();
  }

  // Check if a page has any annotations
  hasAnnotations(pageNumber: number): boolean {
    return (this.annotations.get(pageNumber)?.strokes.length || 0) > 0;
  }

  // Get all pages that have annotations
  getAnnotatedPages(): number[] {
    return Array.from(this.annotations.keys()).filter(page => this.hasAnnotations(page));
  }
}

// Create a singleton instance
const annotationStore = new AnnotationStore();
export default annotationStore;