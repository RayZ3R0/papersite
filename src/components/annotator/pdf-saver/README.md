# PDF Saver Component

This component handles saving PDF annotations by converting canvas annotations to high-quality vector graphics and embedding them in the PDF.

## Core Features

- Vector-based annotation export
- Pressure sensitivity support
- High-DPI display support
- Memory-efficient processing
- Progress reporting
- Error handling

## Usage

```typescript
import PDFSaver from "@/components/annotator/pdf-saver";

// Create instance with PDF file
const saver = new PDFSaver(pdfFile);

// Save with annotations
const result = await saver.save(annotations, {
  onProgress: (progress) => {
    console.log(
      `Processing page ${progress.currentPage} of ${progress.totalPages}`
    );
    console.log(`Status: ${progress.status}`);
  },
});

// Download the result
PDFSaver.downloadBlob(result, "annotated.pdf");
```

## Architecture

The PDF saver is built with several specialized components:

1. **CoordinateMapper**: Handles coordinate transformations between different spaces
2. **SVGGenerator**: Converts strokes to vector paths
3. **PDFModifier**: Handles PDF manipulation and annotation embedding

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
node run-tests.js
```

### Testing

Tests are written using Jest and include:

- Unit tests for individual components
- Integration tests for the full save process
- Mock implementations for browser APIs

Run tests:

```bash
# Run all tests
node run-tests.js

# Run with coverage
node run-tests.js --coverage

# Run in watch mode
node run-tests.js --watch
```

### Test Configuration

- `jest.config.ts`: Jest configuration
- `tsconfig.test.json`: TypeScript configuration for tests
- `__tests__/setup.ts`: Test environment setup

## Implementation Details

### Coordinate Transformation

```typescript
const mapper = new CoordinateMapper(viewport, pdfDimensions);
const pdfPoint = mapper.mapPoint(canvasPoint);
```

### SVG Generation

```typescript
const generator = new SVGGenerator(mapper, dimensions);
const svg = generator.generateSVG(strokes);
```

### PDF Modification

```typescript
const modifier = new PDFModifier({
  pdfBytes,
  annotations,
  onProgress,
});
const result = await modifier.process();
```

## Error Handling

The component includes comprehensive error handling:

```typescript
try {
  await saver.save(annotations);
} catch (error) {
  if (error instanceof PDFSaveError) {
    console.error(getErrorMessage(error));
  }
}
```

## Performance Considerations

- Memory usage is monitored and optimized
- Large PDFs are processed in chunks
- Resources are properly cleaned up
- Temporary canvases are reused when possible

## Browser Support

- Chrome/Edge (full support)
- Firefox (full support)
- Safari (full support)
- Mobile browsers (basic support)

## Known Limitations

1. Maximum PDF size depends on available memory
2. Some complex vector effects may be simplified
3. High-DPI scaling might affect performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests before committing
4. Submit a pull request

## License

MIT License - See LICENSE file for details
