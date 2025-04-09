# Mobile Drawer Enhancement Plan

## Current Issues

- Fixed height (85vh) on mobile can be too tall for smaller screens
- No ability to adjust drawer height
- Doesn't account for different screen sizes efficiently

## Proposed Solution

1. Initial Height:

- Start at 75vh instead of 85vh
- Leave more space for calendar visibility

2. Draggable States:

- Default: 75vh (initial open state)
- Full: 92vh (expanded state, leaving space for top navbar)
- Compact: 50vh (minimized state)

3. Touch Interaction:

- Drag handle to control height
- Smooth transitions between states
- Gesture-based height control
- Snap to nearest state on release

## Implementation Details

### 1. New Hooks

```typescript
// useDrawerGesture.ts
interface DrawerState {
  height: number;
  isDragging: boolean;
  startY: number;
  currentHeight: number;
}
```

### 2. Drawer Height States

```typescript
const DRAWER_STATES = {
  COMPACT: 50, // 50vh
  DEFAULT: 75, // 75vh
  FULL: 92, // 92vh - space for navbar
};
```

### 3. Touch Event Handling

```typescript
// onTouchStart: Capture initial position
// onTouchMove: Update height based on drag
// onTouchEnd: Snap to nearest state
```

### 4. Animation & Transitions

- Smooth animation between states
- Spring physics for natural feel
- Velocity-based animations

## UI/UX Considerations

1. Visual Feedback:

- Subtle shadow changes while dragging
- Visual indicators for state changes
- Smooth transitions

2. Gesture Guidelines:

- Clear drag handle visibility
- Natural movement thresholds
- Intuitive state snapping

3. Performance:

- Hardware acceleration for animations
- Efficient touch event handling
- No jank during transitions

## CSS Implementation

```css
.drawer {
  /* Mobile only */
  @media (max-width: 768px) {
    transition: height 0.3s ease;
    will-change: height;
    touch-action: none; /* Prevent scroll during drag */
  }
}

.drawer-handle {
  /* Mobile only */
  @media (max-width: 768px) {
    height: 4px;
    width: 32px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
}
```

## Implementation Steps

1. Create Gesture Hook:

- Track touch events
- Calculate drag distances
- Determine target states

2. Update Drawer Component:

- Add gesture handler
- Implement height states
- Add smooth transitions

3. Enhance Visual Feedback:

- Add drag indicators
- Implement state transitions
- Add shadow animations

4. Performance Optimization:

- Use transform instead of height
- Hardware acceleration
- Touch event throttling

## Testing Requirements

1. Different Screen Sizes:

- Small phones (iPhone SE)
- Regular phones
- Large phones
- Ensure proper behavior across all

2. Gesture Testing:

- Fast drags
- Slow drags
- Direction changes
- Invalid gestures

3. Visual Testing:

- Smooth animations
- No layout shifts
- Proper state transitions
