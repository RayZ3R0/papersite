# PDF Toolbar Testing Guide

## Components Implemented

1. **Desktop Toolbar**

   - Draggable with momentum and edge detection
   - Minimizable with smooth animations
   - Responsive layout with proper spacing
   - Glass effect design

2. **Mobile Toolbar**

   - Bottom-docked with slide-up animation
   - Collapsible settings panel
   - Touch-optimized controls
   - Responsive to viewport changes

3. **Common Features**
   - Tool selection (pen, highlighter, eraser)
   - Color picker with presets and custom colors
   - Size slider with live preview
   - Opacity control for highlighter
   - Undo/Redo functionality
   - Clear and Save actions
   - Keyboard shortcuts
   - Dark mode support
   - Accessibility features

## Testing Checklist

### Visual Testing

1. **Desktop Layout**

   - [ ] Toolbar appears at initial position
   - [ ] Glass effect is visible
   - [ ] All icons and text are clear and properly aligned
   - [ ] Active tool state is clearly indicated
   - [ ] Minimize/expand animations are smooth
   - [ ] Color picker layout is organized
   - [ ] Sliders show proper previews
   - [ ] Dark mode appearance is correct

2. **Mobile Layout**
   - [ ] Toolbar docks to bottom
   - [ ] Settings panel slides up smoothly
   - [ ] Touch targets are large enough
   - [ ] All controls are easily accessible
   - [ ] Panel transitions are fluid
   - [ ] Landscape mode is handled properly

### Interaction Testing

1. **Dragging (Desktop)**

   - [ ] Toolbar can be dragged smoothly
   - [ ] Momentum effect works naturally
   - [ ] Stays within viewport bounds
   - [ ] Drag handle is responsive
   - [ ] Firefox drag performance is good

2. **Tool Selection**

   - [ ] All tools can be selected
   - [ ] Tool state persists
   - [ ] Visual feedback on selection
   - [ ] Keyboard shortcuts work (P, H, E)

3. **Color Picker**

   - [ ] Presets are clickable
   - [ ] Custom color input works
   - [ ] Color preview updates correctly
   - [ ] Recent colors are saved

4. **Sliders**

   - [ ] Size slider works smoothly
   - [ ] Opacity slider works for highlighter
   - [ ] Preview updates in real-time
   - [ ] Keyboard controls work

5. **Actions**
   - [ ] Undo/Redo buttons enabled/disabled correctly
   - [ ] Clear action works with confirmation
   - [ ] Save action triggers correctly
   - [ ] Keyboard shortcuts work (Ctrl+Z, Ctrl+Y, etc.)

### Performance Testing

1. **Animation Performance**

   - [ ] Minimize/expand is smooth
   - [ ] Settings panel slides smoothly
   - [ ] No layout shifts during transitions
   - [ ] Dragging is fluid

2. **Resource Usage**
   - [ ] No memory leaks
   - [ ] Reasonable CPU usage
   - [ ] Smooth on low-end devices
   - [ ] No performance degradation over time

### Accessibility Testing

1. **Keyboard Navigation**

   - [ ] All controls are focusable
   - [ ] Tab order is logical
   - [ ] Keyboard shortcuts work
   - [ ] Focus indicators are visible

2. **Screen Readers**

   - [ ] All controls have proper labels
   - [ ] State changes are announced
   - [ ] Tool descriptions are clear
   - [ ] Actions are properly described

3. **Reduced Motion**
   - [ ] Animations respect user preferences
   - [ ] Core functionality works without animation
   - [ ] No motion-dependent features

### Cross-browser Testing

1. **Desktop Browsers**

   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

2. **Mobile Browsers**
   - [ ] Chrome for Android
   - [ ] Safari iOS
   - [ ] Samsung Internet
   - [ ] Firefox Mobile

### Error Cases

1. **Network Issues**

   - [ ] Save action handles failures
   - [ ] Load state handles errors
   - [ ] Error messages are clear

2. **Invalid Input**

   - [ ] Color input validation
   - [ ] Size input bounds checking
   - [ ] Opacity input validation

3. **Edge Cases**
   - [ ] Window resize handling
   - [ ] Device rotation handling
   - [ ] Multiple toolbars on page
   - [ ] State persistence

## Test Environment Setup

1. Install dependencies:

```bash
pnpm install
```

2. Run development server:

```bash
pnpm dev
```

3. Run component tests:

```bash
pnpm test:components
```

4. Run E2E tests:

```bash
pnpm test:e2e
```

## Common Issues & Solutions

1. **Dragging Issues**

   - Check pointer capture implementation
   - Verify transform vs position usage
   - Check z-index stacking

2. **Animation Glitches**

   - Verify transition properties
   - Check transform-origin
   - Test with different frame rates

3. **Touch Problems**

   - Verify touch event handling
   - Check viewport meta tags
   - Test with different touch devices

4. **Performance Issues**
   - Use React DevTools profiler
   - Check re-render optimization
   - Verify CSS containment usage

## Release Checklist

1. **Pre-release**

   - [ ] All tests pass
   - [ ] Performance metrics meet targets
   - [ ] Accessibility audit complete
   - [ ] Browser compatibility verified
   - [ ] Documentation updated

2. **Release**

   - [ ] Version bumped
   - [ ] Changelog updated
   - [ ] Dependencies checked
   - [ ] Build artifacts verified

3. **Post-release**
   - [ ] Monitor error rates
   - [ ] Check performance metrics
   - [ ] Gather user feedback
   - [ ] Plan improvements
