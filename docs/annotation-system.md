# PDF Annotation System Documentation

## Overview

The PDF annotation system provides a complete solution for annotating PDF documents with features like drawing, highlighting, and erasing. It uses a multi-layer canvas approach for smooth drawing and efficient rendering.

## Core Components

### 1. AnnotatePage (`src/app/annotate/page.tsx`)

- Handles file upload and PDF viewer initialization
- Provides the main UI container for the annotation system
- Uses dynamic import for PDFViewer to avoid SSR issues

### 2. PDFViewer (`src/components/annotator/PDFViewer.tsx`)

- Core viewer component managing PDF display and annotation
- Features:
  - Page navigation
  - Zoom controls
  - Tool selection
  - Undo/Redo functionality
  - Keyboard shortcuts
  - Touch/Pen input support

### 3. AnnotationLayer (`src/components/annotator/AnnotationLayer.tsx`)

- Handles drawing and rendering of annotations
- Uses dual canvas approach:
  - Main canvas for permanent strokes
  - Temporary canvas for active drawing
- Features:
  - Pressure sensitivity support
  - Custom cursor for eraser tool
  - Smooth line drawing with point optimization
  - Different blend modes for tools

### 4. AnnotationStore (`src/lib/annotationStore.ts`)

- Central state management for annotations
- Features:
  - Per-page annotation storage
  - Undo/Redo stacks
  - Tool settings persistence
  - Point optimization for performance
- Data Structures:

  ```typescript
  type ToolType = "pen" | "highlighter" | "eraser";

  interface Stroke {
    points: Point[];
    color: string;
    size: number;
    opacity: number;
    tool: ToolType;
  }

  interface PageAnnotations {
    strokes: Stroke[];
    undoStack: Stroke[][];
    redoStack: Stroke[][];
  }
  ```

### 5. Rendering System

- Located in `src/components/annotator/rendering/`
- Components:
  - BaseRenderer: Core rendering functionality
  - StrokeRenderer: Specialized stroke rendering with smoothing

## Tools and Features

### Drawing Tools

1. **Pen**

   - Default tool for freehand drawing
   - Configurable size and color
   - Pressure sensitivity support

2. **Highlighter**

   - Semi-transparent highlighting
   - Multiply blend mode for natural look
   - Configurable opacity

3. **Eraser**
   - Custom circular cursor
   - Size-adjustable erasing
   - Precise point removal

### Tool Settings

- Per-tool configuration:
  ```typescript
  const defaultSettings = {
    pen: { size: 2, color: "#000000", opacity: 1 },
    highlighter: { size: 12, color: "#ffeb3b", opacity: 0.3 },
    eraser: { size: 20, opacity: 1 },
  };
  ```
- Settings persist across sessions via localStorage

### Canvas Management

1. **Dual Canvas System**

   - Main canvas: Permanent strokes
   - Temp canvas: Active drawing preview
   - Benefits:
     - Smoother drawing experience
     - No flickering during drawing
     - Better performance

2. **Scaling and Dimensions**
   - Automatic scale calculation based on viewport
   - High-DPI support
   - Maintains aspect ratio

### Event Handling

1. **Drawing Events**

   - pointerdown: Start stroke
   - pointermove: Update stroke
   - pointerup: Finalize stroke
   - Pointer capture for continuous drawing

2. **Keyboard Shortcuts**
   - p: Pen tool
   - h: Highlighter tool
   - e: Eraser tool
   - Ctrl/Cmd + Z: Undo
   - Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo

## Performance Optimizations

1. **Point Optimization**

   - Filters redundant points based on tool type
   - Reduces data storage and improves rendering performance

   ```typescript
   if (distance > (stroke.tool === 'pen' ? 2 : 4))
   ```

2. **Render Optimization**

   - Uses requestAnimationFrame for smooth drawing
   - Canvas clearing optimization
   - Efficient stroke data structure

3. **Memory Management**
   - Cleanup of unused canvases
   - Proper disposal of PDF resources
   - Efficient undo/redo stack management

## Mobile Support

- Touch events handling
- Responsive UI adjustments
- Mobile-friendly tool controls
- Custom cursor handling for touch devices

## Current Limitations

1. The save to PDF functionality is currently disabled
2. No real-time collaboration features
3. Limited annotation types (only freehand drawing tools)
