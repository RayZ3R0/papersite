# Toolbar Visual Improvements Guide

## Design Goals

1. Create a modern, minimal aesthetic
2. Improve visual feedback and interactions
3. Ensure smooth animations
4. Maintain accessibility
5. Support light/dark themes

## Visual Design System

### Colors & Theming

```css
.toolbar {
  /* Light theme */
  --toolbar-bg: rgba(255, 255, 255, 0.85);
  --toolbar-border: rgba(0, 0, 0, 0.1);
  --toolbar-shadow: rgba(0, 0, 0, 0.08);

  /* Dark theme */
  --toolbar-bg-dark: rgba(30, 30, 30, 0.85);
  --toolbar-border-dark: rgba(255, 255, 255, 0.1);
  --toolbar-shadow-dark: rgba(0, 0, 0, 0.2);
}

@media (prefers-color-scheme: dark) {
  .toolbar {
    background: var(--toolbar-bg-dark);
    border-color: var(--toolbar-border-dark);
  }
}
```

### Glass Effect

```css
.toolbar {
  backdrop-filter: blur(8px) saturate(180%);
  background: var(--toolbar-bg);
  border: 1px solid var(--toolbar-border);
  box-shadow: 0 4px 6px -1px var(--toolbar-shadow), 0 2px 4px -1px var(--toolbar-shadow);
}
```

## Animation System

### State Transitions

```css
/* Base transitions */
.toolbar {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms
      cubic-bezier(0.4, 0, 0.2, 1), height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity
      200ms ease-in-out;
}

/* Minimize/Maximize */
.toolbar-minimized {
  transform: scale(0.95);
  opacity: 0.8;
}

/* Show/Hide */
.toolbar-hidden {
  transform: translateY(-10px);
  opacity: 0;
  pointer-events: none;
}
```

### Micro-interactions

```css
/* Button hover effects */
.toolbar-button {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-button:hover {
  transform: translateY(-1px);
  background: var(--hover-bg);
}

.toolbar-button:active {
  transform: scale(0.95);
}

/* Tool selection effect */
.tool-active {
  animation: toolSelect 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toolSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}
```

## Component Improvements

### Sliders

```css
.slider-track {
  height: 4px;
  background: var(--track-bg);
  border-radius: 2px;
  overflow: hidden;
}

.slider-thumb {
  width: 16px;
  height: 16px;
  background: var(--thumb-bg);
  border: 2px solid var(--thumb-border);
  border-radius: 50%;
  box-shadow: 0 1px 3px var(--toolbar-shadow);
  transition: transform 100ms ease;
}

.slider-thumb:hover {
  transform: scale(1.1);
}

.slider-thumb:active {
  transform: scale(0.95);
}
```

### Tool Buttons

```css
.tool-button {
  position: relative;
  padding: 8px;
  border-radius: 8px;
  transition: all 200ms;
}

.tool-button::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: currentColor;
  transition: opacity 200ms;
}

.tool-button:hover::after {
  opacity: 0.1;
}

.tool-button.active::after {
  opacity: 0.15;
}
```

## Layout Improvements

### Grid System

```css
.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 8px;
  padding: 8px;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@container toolbar (max-width: 200px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}
```

### Responsive Behavior

```css
/* Desktop */
@media (min-width: 768px) {
  .toolbar {
    width: 320px;
    border-radius: 12px;
  }
}

/* Tablet */
@media (max-width: 767px) {
  .toolbar {
    width: 280px;
    border-radius: 10px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .toolbar {
    width: 100%;
    border-radius: 0;
    bottom: 0;
    left: 0;
  }
}
```

## Accessibility Considerations

### Focus States

```css
.toolbar-button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .toolbar * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Color Contrast

- Ensure all text meets WCAG 2.1 contrast requirements
- Provide sufficient contrast for icons and controls
- Support high contrast mode
- Include focus indicators

## Performance Considerations

1. Use CSS containment for better performance
2. Optimize animations with will-change
3. Use hardware acceleration where appropriate
4. Minimize layout shifts
5. Implement proper throttling for animations
