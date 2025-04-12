# PDF Saver Implementation Guide

## Required Dependencies

```bash
# Core PDF manipulation
pnpm add -w pdf-lib
pnpm add -w @types/pdf-lib -D

# For SVG handling and high-quality vector graphics
pnpm add -w svg-path-properties
pnpm add -w @svgdotjs/svg.js

# Additional types for better type safety
pnpm add -w @types/pdfjs-dist -D
```

## Implementation Structure

### Directory Structure

```
src/
  components/
    annotator/
      pdf-saver/
        CoordinateTransformer.ts
        SVGGenerator.ts
        PDFExporter.ts
        types.ts
        utils/
          coordinate-utils.ts
          svg-utils.ts
          validation.ts
```

### Integration Points

1. Current System Components Used:

   - AnnotationStore (src/lib/annotationStore.ts)
   - Stroke Renderer (src/components/annotator/rendering/StrokeRenderer.ts)
   - PDF Viewer (src/components/annotator/PDFViewer.tsx)

2. New Components to Add:

   ```typescript
   // src/components/annotator/pdf-saver/types.ts
   export interface PDFExportContext {
     originalPdfBytes: Uint8Array;
     originalDimensions: Map<number, { width: number; height: number }>;
     viewerScale: number;
     devicePixelRatio: number;
     annotationStore: AnnotationStore;
   }

   export interface SVGGeneratorOptions {
     preserveStrokeWidth: boolean;
     vectorizeStrokes: boolean;
     highQuality: boolean;
   }
   ```

## Implementation Strategy

### 1. Coordinate System Integration

Current system's coordinates need to be mapped to PDF coordinates:

```typescript
// src/components/annotator/pdf-saver/CoordinateTransformer.ts
interface Point {
  x: number;
  y: number;
  pressure?: number;
}

class CoordinateTransformer {
  constructor(
    private originalDimensions: Map<number, { width: number; height: number }>,
    private viewerScale: number,
    private devicePixelRatio: number
  ) {}

  // Maps current canvas coordinates to PDF coordinates
  canvasToPdfCoordinates(
    point: Point,
    pageNumber: number,
    canvasWidth: number,
    canvasHeight: number
  ): Point {
    const pageDimensions = this.originalDimensions.get(pageNumber);
    if (!pageDimensions) {
      throw new Error(`No dimensions for page ${pageNumber}`);
    }

    const scaleX = pageDimensions.width / canvasWidth;
    const scaleY = pageDimensions.height / canvasHeight;

    return {
      x: (point.x / this.devicePixelRatio / this.viewerScale) * scaleX,
      y: (point.y / this.devicePixelRatio / this.viewerScale) * scaleY,
      pressure: point.pressure,
    };
  }
}
```

### 2. SVG Generation System

Converts strokes to high-quality SVG paths:

```typescript
// src/components/annotator/pdf-saver/SVGGenerator.ts
class SVGGenerator {
  generateSVGForStrokes(
    strokes: Stroke[],
    transformer: CoordinateTransformer,
    options: SVGGeneratorOptions
  ): string {
    const svg = svgjs().size(width, height);

    strokes.forEach((stroke) => {
      if (stroke.tool === "eraser") return; // Skip eraser strokes

      const path = this.strokeToPath(stroke, transformer);
      const svgPath = svg.path(path).fill("none").stroke({
        color: stroke.color,
        width: stroke.size,
        opacity: stroke.opacity,
      });

      if (stroke.tool === "highlighter") {
        svgPath.attr("mix-blend-mode", "multiply");
      }
    });

    return svg.svg(); // Get SVG string
  }
}
```

### 3. PDF Export System

Handles the final PDF generation:

```typescript
// src/components/annotator/pdf-saver/PDFExporter.ts
class PDFExporter {
  async exportPDF(context: PDFExportContext): Promise<Uint8Array> {
    const pdfDoc = await PDFLib.PDFDocument.load(context.originalPdfBytes);
    const transformer = new CoordinateTransformer(
      context.originalDimensions,
      context.viewerScale,
      context.devicePixelRatio
    );

    for (
      let pageNumber = 1;
      pageNumber <= pdfDoc.getPageCount();
      pageNumber++
    ) {
      const page = pdfDoc.getPage(pageNumber - 1);
      const annotations = context.annotationStore.getStrokes(pageNumber);

      if (annotations.length > 0) {
        const svg = await this.generateSVGLayer(
          annotations,
          transformer,
          page.getSize()
        );

        await this.embedSVGOnPage(svg, page);
      }
    }

    return pdfDoc.save();
  }
}
```

## Quality Assurance

### 1. Validation System

```typescript
// src/components/annotator/pdf-saver/utils/validation.ts
export function validatePDFExport(
  pdfBytes: Uint8Array,
  context: PDFExportContext
): boolean {
  // Check PDF structure
  // Validate page dimensions
  // Verify annotation positions
  // Check for corruption
  return true;
}
```

### 2. Error Handling

```typescript
// src/components/annotator/pdf-saver/utils/error-handling.ts
export class PDFExportError extends Error {
  constructor(
    message: string,
    public code: PDFExportErrorCode,
    public details?: any
  ) {
    super(message);
  }
}

export function handlePDFExportError(error: PDFExportError): void {
  // Log error details
  // Show appropriate user message
  // Trigger cleanup if needed
}
```

## Usage Instructions

1. Initialize PDF Export:

```typescript
const exportContext = await preparePdfExportContext(pdfFile);
```

2. Configure Export Options:

```typescript
const exportOptions = {
  preserveStrokeWidth: true,
  vectorizeStrokes: true,
  highQuality: true,
};
```

3. Export PDF:

```typescript
const pdfExporter = new PDFExporter();
const pdfBytes = await pdfExporter.exportPDF(exportContext, exportOptions);
```

## Notes for Integration

1. Scale Considerations:

   - Account for devicePixelRatio
   - Handle viewer zoom levels
   - Preserve stroke widths correctly

2. Memory Management:

   - Release SVG resources after embedding
   - Clean up temporary canvases
   - Handle large PDFs efficiently

3. Browser Compatibility:
   - Test across major browsers
   - Handle vendor-specific SVG implementations
   - Consider polyfills for older browsers
