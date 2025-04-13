# Toolbar Migration Plan

## Overview

This document outlines the step-by-step process for implementing the toolbar improvements while maintaining stability and minimizing disruption.

## Migration Phases

### Phase 1: Foundation Updates (Week 1)

1. **File Structure Reorganization**

```
Before:
src/components/annotator/Toolbar/
├── index.tsx
├── types.ts
└── components/

After:
src/components/annotator/Toolbar/
├── components/
│   ├── DesktopToolbar/
│   ├── MobileToolbar/
│   └── shared/
├── hooks/
├── styles/
└── utils/
```

2. **Dependencies Update**

```json
{
  "dependencies": {
    "@radix-ui/react-toolbar": "^latest",
    "framer-motion": "^latest",
    "@use-gesture/react": "^latest"
  }
}
```

### Phase 2: Core Functionality (Week 2)

1. **Drag System Migration**

- Create new hook alongside existing one
- Test in parallel
- Gradually migrate components
- Validate performance

2. **State Management Updates**

- Implement new state structure
- Add migration layer
- Update component interfaces
- Validate state consistency

### Phase 3: Visual Updates (Week 3)

1. **CSS Updates**

```css
/* Step 1: Add new variables */
:root {
  /* Add new design tokens */
}

/* Step 2: Create new classes */
.toolbar-new {
  /* Add new styles */
}

/* Step 3: Deprecate old classes */
.toolbar-old {
  /* Mark for removal */
}
```

2. **Component Updates**

- Update one component at a time
- Add feature flags
- Test visual regressions
- Validate accessibility

## Testing Strategy

### 1. Unit Tests

```typescript
describe("Toolbar Migration", () => {
  it("maintains existing functionality", () => {
    // Test core features
  });

  it("supports new features", () => {
    // Test new capabilities
  });
});
```

### 2. Integration Tests

- Cross-browser testing
- Touch device testing
- Performance benchmarking
- Accessibility validation

## Rollback Plan

### Quick Rollback

```typescript
// Feature flags
const USE_NEW_TOOLBAR = process.env.USE_NEW_TOOLBAR === "true";

export function Toolbar(props: ToolbarProps) {
  if (USE_NEW_TOOLBAR) {
    return <NewToolbar {...props} />;
  }
  return <LegacyToolbar {...props} />;
}
```

### Gradual Rollback

1. Disable new features
2. Revert visual changes
3. Restore old components
4. Remove new dependencies

## Performance Monitoring

### Metrics to Track

- Frame rate during animations
- Time to interactive
- Memory usage
- Bundle size impact
- Layout shifts

### Implementation

```typescript
const PERFORMANCE_THRESHOLDS = {
  frameRate: 60,
  interactionDelay: 100,
  layoutShift: 0.1,
};

function monitorPerformance() {
  // Track metrics
  // Report violations
  // Log to analytics
}
```

## Communication Plan

### For Developers

1. Update documentation
2. Create migration guides
3. Schedule team reviews
4. Plan pair programming

### For Users

1. Add visual indicators
2. Provide feedback channels
3. Create help documentation
4. Monitor support requests

## Timeline

### Week 1: Foundation

- [ ] Setup new structure
- [ ] Add dependencies
- [ ] Create test environment
- [ ] Update documentation

### Week 2: Core Updates

- [ ] Implement new drag system
- [ ] Update state management
- [ ] Add performance monitoring
- [ ] Run integration tests

### Week 3: Visual Updates

- [ ] Update styles
- [ ] Implement animations
- [ ] Test accessibility
- [ ] Gather feedback

### Week 4: Polish

- [ ] Fix reported issues
- [ ] Optimize performance
- [ ] Update documentation
- [ ] Release final version

## Success Criteria

### Technical Requirements

- No performance regressions
- Full test coverage
- Accessibility compliance
- Cross-browser support

### User Experience

- Smooth animations
- Consistent behavior
- Intuitive interactions
- Responsive design

## Post-Migration Tasks

### Code Cleanup

- Remove legacy code
- Update dependencies
- Clean up tests
- Archive old docs

### Documentation

- Update API docs
- Create examples
- Add migration guides
- Update README

### Monitoring

- Track usage metrics
- Monitor performance
- Collect feedback
- Plan improvements
