# Toolbar Implementation Guide

## Implementation Strategy

### Phase 1: Core Structure Updates

1. **Component Organization**

```
src/components/annotator/Toolbar/
├── components/
│   ├── DesktopToolbar.tsx
│   ├── MobileToolbar.tsx
│   ├── ToolButton.tsx
│   ├── Slider.tsx
│   └── Tooltip.tsx
├── hooks/
│   ├── useDraggable.tsx
│   ├── useToolbarState.tsx
│   └── useToolbarAnimation.tsx
├── styles/
│   ├── toolbar.css
│   └── animations.css
└── index.tsx
```

2. **State Management**

```typescript
// useToolbarState.tsx
interface ToolbarState {
  position: { x: number; y: number };
  isMinimized: boolean;
  isVisible: boolean;
  activeTool: ToolType;
  isDragging: boolean;
}

function useToolbarState() {
  // Implement state management with proper persistence
  // Handle window resize and viewport changes
  // Manage tool selection and settings
}
```

### Phase 2: Performance Optimizations

1. **Dragging System**

```typescript
// useDraggable.tsx
interface DragState {
  startPosition: Position;
  currentPosition: Position;
  velocity: Position;
  timestamp: number;
}

function useDraggable() {
  // Use pointer events for better cross-browser support
  // Implement velocity-based animations
  // Add bounds checking and edge snapping
  // Handle touch events properly
}
```

2. **Animation System**

```typescript
// useToolbarAnimation.tsx
interface AnimationConfig {
  duration: number;
  easing: string;
  springConfig?: { tension: number; friction: number };
}

function useToolbarAnimation() {
  // Implement spring physics for natural movement
  // Handle animation interruptions
  // Manage transition states
  // Support reduced motion preferences
}
```

### Phase 3: Visual Improvements

1. **CSS Architecture**

```scss
// toolbar.css
.toolbar {
  // Use CSS custom properties for theming
  // Implement container queries for responsive layout
  // Add proper z-index management
  // Handle backdrop blur effects
}

// Minimize transition
.toolbar--minimized {
  // Add spring-based animations
  // Handle content transitions
  // Manage focus states
}

// Drag state
.toolbar--dragging {
  // Add visual feedback
  // Handle cursor states
  // Manage shadows and depth
}
```

2. **Component Enhancements**

```typescript
// ToolButton.tsx
interface ToolButtonProps {
  tool: ToolType;
  isActive: boolean;
  onSelect: (tool: ToolType) => void;
  children: React.ReactNode;
}

// Add ripple effects
// Implement hover states
// Handle focus management
// Support keyboard navigation
```

## Error Handling Strategy

1. **Error Boundaries**

```typescript
class ToolbarErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    // Handle specific error types
    // Provide fallback UI
    // Log errors appropriately
  }
}
```

2. **Error Types**

```typescript
class ToolbarError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
  }
}
```

## Performance Monitoring

1. **Metrics Collection**

```typescript
interface PerformanceMetrics {
  frameRate: number;
  dragLatency: number;
  animationDuration: number;
  layoutShifts: number;
}

function monitorToolbarPerformance() {
  // Track key metrics
  // Report performance issues
  // Handle performance degradation
}
```

2. **Optimization Techniques**

```typescript
// Apply performance optimizations
const ToolbarComponent = memo(({ children }) => {
  // Use proper memoization
  // Implement virtual rendering if needed
  // Handle large lists efficiently
});
```

## Testing Strategy

1. **Unit Tests**

```typescript
describe("Toolbar Components", () => {
  test("drag behavior", () => {
    // Test pointer events
    // Verify position calculations
    // Check bounds handling
  });

  test("animations", () => {
    // Verify transition states
    // Test interrupted animations
    // Check reduced motion support
  });
});
```

2. **Integration Tests**

```typescript
describe("Toolbar System", () => {
  test("state management", () => {
    // Test tool selection
    // Verify settings persistence
    // Check responsive behavior
  });

  test("error handling", () => {
    // Verify error boundaries
    // Test recovery mechanisms
    // Check error reporting
  });
});
```

## Accessibility Implementation

1. **ARIA Support**

```typescript
function setAriaAttributes(element: HTMLElement) {
  // Add proper roles
  // Set aria labels
  // Handle focus management
  // Support keyboard navigation
}
```

2. **Keyboard Navigation**

```typescript
function handleKeyboardNavigation(event: KeyboardEvent) {
  // Implement keyboard shortcuts
  // Handle focus trapping
  // Support screen readers
  // Manage focus states
}
```

## Documentation Requirements

1. **Component Documentation**

```typescript
/**
 * Toolbar component documentation
 * @property {ToolbarProps} props - Component props
 * @example
 * <Toolbar
 *   position={{ x: 0, y: 0 }}
 *   tools={availableTools}
 *   onToolSelect={handleToolSelect}
 * />
 */
```

2. **Integration Guide**

```markdown
## Toolbar Integration

1. Import required components
2. Configure state management
3. Set up error boundaries
4. Initialize performance monitoring
5. Add accessibility support
```
