# Toolbar Drag Improvements Guide

## Current Issues

1. Firefox performance lag during dragging
2. Jerky movement on low-performance devices
3. Poor touch device support
4. Inconsistent dragging behavior across browsers
5. Layout shifts during drag operations

## Proposed Solutions

### 1. Use CSS Transform for Positioning

Instead of modifying `left` and `top` properties, we'll use CSS transforms:

```css
.draggable-toolbar {
  position: fixed;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  contain: layout style paint;
}
```

### 2. Pointer Events Implementation

Replace mouse events with Pointer Events API:

```typescript
interface DragState {
  isDragging: boolean;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
}

// Handle both touch and mouse events uniformly
element.addEventListener("pointerdown", handlePointerDown);
element.addEventListener("pointermove", handlePointerMove);
element.addEventListener("pointerup", handlePointerUp);
element.addEventListener("pointercancel", handlePointerUp);
```

### 3. Performance Optimizations

- Use `requestAnimationFrame` for smooth updates
- Implement velocity-based momentum
- Add edge bounce effect
- Optimize repaints using contain property

### 4. Smart Positioning

```typescript
function getBoundedPosition(x: number, y: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const elementRect = element.getBoundingClientRect();

  return {
    x: Math.min(Math.max(0, x), viewportWidth - elementRect.width),
    y: Math.min(Math.max(0, y), viewportHeight - elementRect.height),
  };
}
```

### 5. Animation Improvements

```css
.draggable-toolbar {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.draggable-toolbar.dragging {
  transition: none;
  cursor: grabbing;
}

.draggable-toolbar:not(.dragging) {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## Implementation Steps

### Phase 1: Core Updates

1. Replace position-based movement with transforms
2. Implement Pointer Events API
3. Add requestAnimationFrame for updates
4. Add proper event cleanup

### Phase 2: Touch Optimization

1. Add touch-specific handling
2. Implement momentum scrolling
3. Add edge bounce effects
4. Improve touch target sizes

### Phase 3: Visual Polish

1. Add drag shadows
2. Implement smooth transitions
3. Add visual feedback
4. Optimize for different viewports

## Testing Requirements

### Performance Testing

- Test on low-end devices
- Monitor frame rates
- Check memory usage
- Verify smooth animations

### Browser Testing

- Chrome/Edge latest
- Firefox latest
- Safari latest
- Mobile browsers
- Different viewport sizes

### Touch Testing

- Test on various touch devices
- Verify multi-touch handling
- Check gesture conflicts
- Test with different screen sizes

## Error Handling

### Common Issues

1. Out of bounds dragging
2. Event listener memory leaks
3. Touch event conflicts
4. Performance degradation
5. Browser-specific bugs

### Prevention Strategies

1. Implement proper cleanup
2. Add error boundaries
3. Use feature detection
4. Add performance monitoring
5. Implement fallback behaviors

## Accessibility Considerations

### Requirements

1. Keyboard navigation support
2. ARIA attributes
3. Focus management
4. Screen reader support
5. High contrast support

### Implementation

```typescript
// Add keyboard support
element.setAttribute("role", "toolbar");
element.setAttribute("aria-label", "Annotation tools");
element.setAttribute("tabindex", "0");
```

## Performance Monitoring

### Metrics to Track

1. Frame rate during drag
2. Time to first interaction
3. Input latency
4. Memory usage
5. Layout shifts

### Tools

1. Performance API
2. RequestAnimationFrame timing
3. Layout shift tracking
4. Memory profiling
5. Frame rate monitoring

## Future Improvements

### Planned Features

1. Elastic edge bouncing
2. Velocity-based movement
3. Magnetic edge snapping
4. Multi-window support
5. Gesture customization
