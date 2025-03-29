# PDF Annotator Implementation

## Overview

A web-based PDF annotator with pressure sensitivity, supporting various annotation tools and working across devices. The implementation focuses on a native-like experience with smooth strokes and robust undo/redo functionality.

## Features

### Core Features (✅ Completed)

- PDF file upload and viewing
- Responsive layout with proper page scaling
- Touch and pressure sensitivity support
- Multiple annotation tools:
  - Pen with pressure sensitivity
  - Highlighter with semi-transparency
  - Eraser tool
- Undo/redo functionality
- Page-specific annotations
- Keyboard shortcuts

### Drawing Tools

1. Pen Tool

   - Pressure-sensitive stroke width
   - Smooth lines using quadratic curves
   - Direct color control

2. Highlighter

   - Semi-transparent strokes (30% opacity)
   - Wide stroke width
   - Smooth rendering without visible segments

3. Eraser
   - Precision erasing with adjustable size
   - Works with all annotation types

### User Interface

- Floating toolbar (desktop: left side, mobile: bottom)
- Color picker with presets
- Size controls for each tool
- Page navigation
- Zoom controls

### Keyboard Shortcuts

- `P`: Switch to Pen tool
- `H`: Switch to Highlighter
- `E`: Switch to Eraser
- `Ctrl/⌘ + Z`: Undo
- `Ctrl/⌘ + Shift + Z` or `Ctrl/⌘ + Y`: Redo

## Technical Implementation

### Canvas Management

- Separate canvas layer for annotations
- Pressure-sensitive drawing using Pointer Events API
- Efficient stroke rendering with quadratic curves
- View scaling independent of drawing coordinates

### Annotation Storage

- Page-specific stroke storage
- Undo/redo history stacks per page
- Stroke data structure:
  ```typescript
  interface Stroke {
    points: { x: number; y: number; pressure: number }[];
    color: string;
    size: number;
  }
  ```

### Cross-Device Support

- Desktop: Full pressure sensitivity with graphics tablets
- Mobile: Touch and Apple Pencil support
- Fallback to standard pressure for non-pressure devices

## Upcoming Features

### Phase 1 (Next)

- [ ] PDF export with annotations
- [ ] Shape tools (rectangle, circle)
- [ ] Text annotations
- [ ] Custom pressure curve adjustment

### Phase 2

- [ ] Multi-page view
- [ ] Annotation thumbnails
- [ ] Layer management
- [ ] Tool presets

### Phase 3

- [ ] Collaboration features
- [ ] Cloud storage integration
- [ ] Annotation search
- [ ] Template support
