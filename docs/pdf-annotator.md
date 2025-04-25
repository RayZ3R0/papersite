# PDF Annotator Component

A React component for viewing and annotating PDF documents. Features include:

- Pen tool for freehand drawing
- Eraser tool for removing annotations
- Color picker for pen color
- Adjustable stroke width
- Page navigation
- Zoom and rotation controls

## Installation

The PDF Annotator uses `react-pdf` and `pdf-lib` for PDF handling. Install the required dependencies:

```bash
pnpm add -w react-pdf pdf-lib
```

## Usage

```tsx
import PDFViewer from "@/components/annotator/PDFViewer";

// Using with a file
function MyComponent() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && <PDFViewer file={file} />}
    </div>
  );
}

// Using with a URL
function MyComponent() {
  return <PDFViewer file={{ url: "path/to/document.pdf" }} />;
}
```

## Features

### Drawing Tools

1. Pen Tool

   - Click the pen icon to activate
   - Choose color using the color picker
   - Adjust stroke width with the slider
   - Draw freehand on the PDF

2. Eraser Tool
   - Click the eraser icon to activate
   - Adjust eraser size with the slider
   - Click and drag to erase annotations

### Document Controls

- Page Navigation

  - Use Previous/Next buttons to move between pages
  - Current page number and total pages are displayed

- View Controls
  - Zoom In/Out: Adjust the document scale
  - Rotate: Rotate the document in 90-degree increments

## Component Structure

The annotator is composed of three main components:

1. `PDFViewer`: Main component handling PDF display and tool state
2. `Toolbar`: Contains drawing tools and controls
3. `AnnotationLayer`: Handles drawing and annotation rendering

## Styling

The annotator uses CSS modules for styling. Custom styles can be applied by overriding the following classes:

```css
.annotation-layer {
  /* Canvas styles */
}

.toolbar {
  /* Toolbar styles */
}

.tool-button {
  /* Tool button styles */
}
```

## Technical Details

### Canvas Rendering

- Uses HTML5 Canvas for drawing
- Maintains separate canvas layers for each page
- Handles high DPI displays with device pixel ratio scaling
- Implements smooth curve interpolation for better drawing quality

### PDF Integration

- Built on `react-pdf` for PDF rendering
- Uses PDF.js worker for PDF processing
- Maintains proper scaling between PDF and annotation layers

### Performance

- Uses requestAnimationFrame for smooth drawing
- Implements efficient path rendering
- Handles touch events for mobile support

## Browser Support

The annotator works in modern browsers that support:

- HTML5 Canvas
- PDF.js
- Touch events (for mobile support)

## Known Limitations

1. Memory usage can increase with large PDFs or many annotations
2. Mobile performance may vary depending on device capabilities
3. PDF.js worker needs to be loaded from CDN or served locally

## Future Improvements

1. Add support for more annotation types (text, shapes)
2. Implement annotation persistence
3. Add undo/redo functionality
4. Support annotation export in standard PDF format
