# PDF Saver Implementation Steps

## Current Setup Analysis

### Existing Dependencies

```json
{
  "pdf-lib": "^1.17.1", // For PDF manipulation
  "pdfjs-dist": "^3.11.174", // For PDF rendering
  "canvas": "^3.1.0" // For drawing operations
}
```

### Additional Dependencies Needed

```bash
pnpm add -w @svgdotjs/svg.js svg-path-properties
```

## Implementation Steps

### 1. Component Structure Creation

```
src/components/annotator/pdf-saver/
├── index.ts               # Main export
├── CoordinateMapper.ts    # Coordinate transformation
├── SVGConverter.ts        # Stroke to SVG conversion
├── PDFModifier.ts        # PDF modification logic
└── utils/
    ├── validation.ts     # Export validation
    └── error-handling.ts # Error management
```

### 2. Phase-wise Implementation

#### Phase 1: Coordinate System (Day 1)

1. Create CoordinateMapper class
2. Implement canvas-to-PDF coordinate transformation
3. Add viewport scaling compensation
4. Handle high-DPI displays

#### Phase 2: SVG Generation (Day 2)

1. Create SVGConverter class
2. Implement stroke-to-path conversion
3. Handle different tools (pen, highlighter)
4. Optimize SVG output

#### Phase 3: PDF Modification (Day 3)

1. Create PDFModifier class
2. Implement page modification logic
3. Handle SVG embedding
4. Manage memory efficiently

#### Phase 4: Integration (Day 4)

1. Connect all components
2. Add progress reporting
3. Implement error handling
4. Add validation checks

## Detailed Requirements

### 1. CoordinateMapper Implementation

```typescript
class CoordinateMapper {
  constructor(
    private viewportDimensions: ViewportDimensions,
    private pdfDimensions: PDFDimensions
  ) {}

  mapPoint(point: Point): PDFPoint {
    // Transform canvas coordinates to PDF space
    // Account for:
    // - Device pixel ratio
    // - Viewport scale
    // - PDF point system (72 DPI)
  }

  mapStroke(stroke: Stroke): PDFStroke {
    // Transform entire stroke
    // Maintain pressure sensitivity
    // Handle tool-specific transformations
  }
}
```

### 2. SVG Conversion Strategy

```typescript
interface SVGConversionOptions {
  maintainPressure: boolean;
  optimizePaths: boolean;
  vectorizePaths: boolean;
}

class SVGConverter {
  convertStroke(stroke: Stroke, options: SVGConversionOptions): SVGPathData {
    // Convert stroke to SVG path
    // Handle different tools
    // Apply pressure sensitivity if needed
  }

  optimizePath(path: SVGPathData): SVGPathData {
    // Reduce points while maintaining quality
    // Smooth curves
    // Remove redundant points
  }
}
```

### 3. PDF Modification Process

```typescript
interface PDFModificationOptions {
  maintainMetadata: boolean;
  compressionLevel: number;
  embedFonts: boolean;
}

class PDFModifier {
  async modifyPDF(
    originalPDF: ArrayBuffer,
    annotations: PageAnnotations[],
    options: PDFModificationOptions
  ): Promise<Uint8Array> {
    // Load PDF
    // For each page:
    //   - Create SVG layer
    //   - Convert to PDF objects
    //   - Embed in page
    // Save modified PDF
  }
}
```

## Implementation Priorities

1. **Correctness**

   - Exact coordinate mapping
   - Precise stroke reproduction
   - Proper tool rendering

2. **Performance**

   - Efficient memory usage
   - Optimized SVG generation
   - Smart page processing

3. **Reliability**

   - Error handling
   - Progress reporting
   - Validation checks

4. **User Experience**
   - Progress feedback
   - Cancelable operations
   - Error recovery

## Testing Strategy

1. **Unit Tests**

   - Coordinate transformation
   - SVG conversion
   - PDF modification

2. **Integration Tests**

   - Full save process
   - Error handling
   - Memory usage

3. **Visual Tests**
   - Stroke appearance
   - Tool rendering
   - Scaling accuracy

## Rollout Plan

1. **Alpha Testing**

   - Internal testing
   - Memory profiling
   - Performance benchmarking

2. **Beta Testing**

   - Limited user testing
   - Different PDF types
   - Various annotation scenarios

3. **Production Release**
   - Feature flag controlled
   - Gradual rollout
   - Monitoring and logging

## Success Metrics

1. **Technical Metrics**

   - Export success rate
   - Processing time
   - Memory usage

2. **Quality Metrics**

   - Visual accuracy
   - Position precision
   - Tool rendering quality

3. **User Metrics**
   - Export completion rate
   - Error frequency
   - User satisfaction
