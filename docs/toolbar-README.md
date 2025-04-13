# PDF Annotator Toolbar

A customizable, performant, and accessible toolbar component for PDF annotations.

## Features

- 🎨 Modern, minimal design with glass effect
- 🔄 Smooth drag-and-drop with momentum
- 📱 Full touch device support
- 🌓 Light/dark theme support
- ♿ WCAG 2.1 compliant
- ⚡ Optimized performance
- 🎯 Precise tool controls
- 📏 Customizable sizing
- 🔍 Smart positioning

## Quick Start

```tsx
import { Toolbar } from "@/components/annotator/Toolbar";

function PDFAnnotator() {
  return (
    <Toolbar
      onToolChange={handleToolChange}
      onColorChange={handleColorChange}
      onSizeChange={handleSizeChange}
      onOpacityChange={handleOpacityChange}
    />
  );
}
```

## Props Interface

```typescript
interface ToolbarProps {
  // Tool Selection
  currentTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;

  // Style Controls
  currentColor?: string;
  onColorChange?: (color: string) => void;
  currentSize?: number;
  onSizeChange?: (size: number) => void;
  currentOpacity?: number;
  onOpacityChange?: (opacity: number) => void;

  // History Controls
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onSave?: () => void;

  // Visibility
  initiallyVisible?: boolean;
  position?: { x: number; y: number };
}
```

## Available Tools

- ✏️ Pen: Freehand drawing
- 🖍️ Highlighter: Transparent highlights
- ❌ Eraser: Remove annotations

## Customization

### Theme Variables

```css
.toolbar {
  /* Colors */
  --toolbar-bg: rgba(255, 255, 255, 0.85);
  --toolbar-border: rgba(0, 0, 0, 0.1);
  --toolbar-text: #1a1a1a;

  /* Sizing */
  --toolbar-width: 320px;
  --toolbar-min-width: 70px;
  --toolbar-border-radius: 12px;

  /* Animations */
  --toolbar-transition: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Custom Styling

```tsx
<Toolbar
  className="custom-toolbar"
  style={{
    "--toolbar-bg": "rgba(0, 0, 0, 0.8)",
    "--toolbar-text": "#ffffff",
  }}
/>
```

## Keyboard Shortcuts

| Action    | Shortcut        |
| --------- | --------------- |
| Undo      | Ctrl/⌘ + Z      |
| Redo      | Ctrl/⌘ + Y      |
| Clear     | Ctrl/⌘ + Delete |
| Save      | Ctrl/⌘ + S      |
| Hide/Show | Esc             |

## Best Practices

### Performance

1. **Minimize Rerenders**

```tsx
const MemoizedToolbar = memo(Toolbar, (prev, next) => {
  // Custom comparison logic
});
```

2. **Event Handling**

```tsx
// Debounce size changes
const handleSizeChange = debounce((size: number) => {
  onSizeChange?.(size);
}, 16);
```

### Accessibility

1. **Keyboard Navigation**

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Tab") {
    // Handle focus management
  }
};
```

2. **Screen Readers**

```tsx
<button
  role="toolbar"
  aria-label="Drawing tools"
  aria-controls="annotation-canvas"
/>
```

## Mobile Support

The toolbar automatically adapts to touch devices with:

- Larger hit areas
- Touch-friendly controls
- Smart positioning
- Gesture support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- iOS Safari 14+
- Chrome for Android

## Contributing

1. Check existing issues/create new one
2. Fork the repository
3. Create feature branch
4. Add tests for new features
5. Submit pull request

## Testing

```bash
# Run unit tests
npm test

# Run visual regression tests
npm run test:visual

# Run accessibility tests
npm run test:a11y
```

## Performance Monitoring

The toolbar includes built-in performance monitoring:

```typescript
import { useToolbarMetrics } from "./hooks/useToolbarMetrics";

const metrics = useToolbarMetrics();
console.log(metrics.frameRate, metrics.interactionDelay);
```

## Troubleshooting

### Common Issues

1. **Jerky Animations**

   - Check hardware acceleration
   - Verify transform usage
   - Monitor frame rate

2. **Touch Issues**

   - Enable touch events
   - Check event propagation
   - Verify viewport settings

3. **Visual Glitches**
   - Clear transform origin
   - Check z-index stacking
   - Verify CSS containment

## License

MIT License - See LICENSE file
