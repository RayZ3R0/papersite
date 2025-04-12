# PDF Annotation System: Technical Deep Dive

## Architecture Overview

### Core Technology Stack

- React (Next.js) for UI and component management
- Canvas API for rendering and drawing
- PDF.js for PDF rendering and manipulation
- TypeScript for type safety and better developer experience

### Component Hierarchy

```
AnnotatePage
├── PDFViewer
│   ├── Document (react-pdf)
│   ├── Page (react-pdf)
│   ├── AnnotationLayer
│   │   ├── MainCanvas
│   │   └── TempCanvas
│   └── Toolbar
└── SaveProgress
```

## Detailed Component Analysis

### 1. Canvas System Implementation

#### Dual Canvas Architecture

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null); // Main canvas
const tempCanvasRef = useRef<HTMLCanvasElement>(null); // Temporary canvas
const ctx = useRef<CanvasRenderingContext2D | null>(null);
const tempCtx = useRef<CanvasRenderingContext2D | null>(null);
```

- **Main Canvas**: Stores permanent strokes

  - Uses `willReadFrequently: true` optimization
  - Handles composite operations for different tools
  - Maintains scaled dimensions for high DPI

- **Temporary Canvas**: Handles active drawing
  - Reduces redraw operations
  - Provides immediate visual feedback
  - Clears efficiently between strokes

#### Canvas Context Configuration

```typescript
function setupDrawingContext(context: CanvasRenderingContext2D) {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(scale, scale);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalCompositeOperation =
    tool === "eraser" ? "destination-out" : "source-over";
  context.globalAlpha = tool === "highlighter" ? opacity : 1;
}
```

### 2. Rendering Pipeline

#### Stroke Rendering Process

1. **Point Collection**

   ```typescript
   interface Point {
     x: number;
     y: number;
     pressure: number; // Pen pressure (0.0 to 1.0)
   }
   ```

2. **Point Optimization**

   ```typescript
   function optimizePoints(points: Point[]): Point[] {
     return points.filter((point, index, array) => {
       if (index === 0 || index === array.length - 1) return true;
       const prevPoint = array[index - 1];
       const distance = getDistance(point, prevPoint);
       return distance > (tool === "pen" ? 2 : 4);
     });
   }
   ```

3. **Smooth Line Drawing**
   ```typescript
   function drawSmoothLine(points: Point[]) {
     for (let i = 1; i < points.length - 2; i++) {
       const xc = (points[i].x + points[i + 1].x) / 2;
       const yc = (points[i].y + points[i + 1].y) / 2;
       context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
     }
   }
   ```

### 3. State Management

#### AnnotationStore Architecture

```typescript
class AnnotationStore {
  private annotations: Map<number, PageAnnotations>;
  private settings: ToolSettings;

  interface PageAnnotations {
    strokes: Stroke[];
    undoStack: Stroke[][];
    redoStack: Stroke[][];
  }
}
```

#### Undo/Redo Implementation

```typescript
function addStroke(pageNumber: number, stroke: Stroke) {
  const page = this.getPage(pageNumber);
  page.undoStack.push([...page.strokes]); // Save current state
  page.strokes.push(stroke); // Add new stroke
  page.redoStack = []; // Clear redo history
}
```

### 4. Event Handling System

#### Pointer Events

```typescript
interface PointerState {
  isDrawing: boolean;
  lastPoint: Point | null;
  currentStroke: Stroke | null;
  pointBuffer: Point[];
}

// Event Handlers
pointerdown: Start new stroke, capture pointer
pointermove: Add points, update temp canvas
pointerup: Finalize stroke, update main canvas
```

#### Pressure Sensitivity

```typescript
function getPointWithPressure(e: PointerEvent): Point {
  return {
    x: (e.clientX - rect.left) / scale,
    y: (e.clientY - rect.top) / scale,
    pressure: e.pressure || 0.5, // Default to 0.5 if not supported
  };
}
```

### 5. Tool Implementations

#### Highlighter Tool

```typescript
interface HighlighterConfig {
  blendMode: "multiply";
  defaultOpacity: 0.3;
  defaultSize: 12;
  pressureSensitive: false;
}
```

#### Eraser Tool

```typescript
function createEraserCursor(size: number): string {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // Draw outer circle (border)
  // Draw inner circle (fill)
  return `url(${canvas.toDataURL()}) ${size / 2} ${size / 2}, crosshair`;
}
```

## Performance Optimizations

### 1. Memory Management

- Canvas clearing strategies
- Efficient stroke data structures
- Automatic garbage collection triggers

### 2. Rendering Optimizations

- RequestAnimationFrame scheduling
- Point reduction algorithms
- Efficient canvas state management

### 3. Event Throttling

```typescript
function throttleEvents(handler: Function, wait: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      handler.apply(this, args);
      lastCall = now;
    }
  };
}
```

## Technical Limitations and Future Improvements

### Current Technical Constraints

1. Memory usage with large PDFs
2. Canvas size limitations
3. Mobile device performance

### Potential Improvements

1. WebAssembly for PDF processing
2. Web Workers for background operations
3. IndexedDB for annotation persistence
4. WebGL rendering for better performance

## Mobile-Specific Implementations

### Touch Event Handling

```typescript
function handleTouchStart(e: TouchEvent) {
  e.preventDefault();
  const touch = e.touches[0];
  const point = getPointFromTouch(touch);
  startStroke(point);
}
```

### Responsive Canvas Scaling

```typescript
function calculateCanvasSize() {
  const containerWidth = containerRef.current?.clientWidth ?? window.innerWidth;
  const scale = Math.min(
    containerWidth / pdfWidth,
    (window.innerHeight * 0.9) / pdfHeight
  );
  return { width: pdfWidth * scale, height: pdfHeight * scale };
}
```
