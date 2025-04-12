# Annotate Page Enhancement Plan

## Overview

This plan outlines the enhancement of the /annotate page to provide a clean, searchable interface for past papers while maintaining the PDF annotation functionality.

## Important Warnings ⚠️

1. DO NOT modify existing functionality in:

   - /search
   - /papers
   - /papers/[subject]
   - Any PDF annotation/viewer components

2. Create new components instead of modifying existing ones
3. Maintain separation of concerns between annotation and browsing features
4. Preserve all existing PDF annotation capabilities

## Implementation Phases

### Phase 1: Architecture & Foundation

- Create new components:
  - `src/components/annotate/layout/` - Layout components
  - `src/components/annotate/browser/` - Paper browsing components
  - `src/components/annotate/search/` - Search components
- Implement base page structure:
  ```
  /annotate
    ├── layout.tsx
    ├── page.tsx (main interface)
    └── [subject]
        └── page.tsx (subject view)
  ```

#### Deliverables

- Basic page layout
- Navigation structure
- Component architecture
- Type definitions

### Phase 2: Paper Browser UI

- Subject grid layout similar to /papers
- Unit cards with paper listings
- Implement smooth transitions
- Mobile-responsive design

#### Components

```typescript
-SubjectGrid - UnitCard - PaperList - PaperCard;
```

#### Deliverables

- Clean, themed UI matching site style
- Responsive grid layout
- Unit/paper organization
- Preview thumbnails

### Phase 3: Search Integration

- Implement paper search similar to /search
- Add filters for:
  - Subjects
  - Units
  - Years
  - Seasons

#### Components

```typescript
-SearchBar - FilterPanel - SearchResults;
```

#### Deliverables

- Full-text search
- Filter functionality
- Real-time results
- Search history

### Phase 4: PDF Integration

- Connect browser UI to PDF viewer
- Smooth transitions between browsing and annotating
- Loading states and error handling

#### Components

```typescript
-PDFLoader - ViewerWrapper - TransitionManager;
```

#### Deliverables

- Seamless viewer integration
- State management
- Error boundaries
- Loading indicators

### Phase 5: Polish & Optimization

- Performance optimizations
- Loading states
- Error handling
- Analytics integration
- Documentation

## Testing Strategy

- Unit tests for new components
- Integration tests for search
- E2E tests for critical paths
- Performance benchmarks

## Technical Requirements

### Styling

- Use existing theme classes
- Follow BEM naming convention
- Maintain dark mode support

### State Management

- Use React context where needed
- Maintain URL state for navigation
- Consider using Zustand for complex state

### Data Flow

```
Browser UI <-> URL State <-> PDF Viewer
       ^
       |
    Search
```

### Performance Targets

- First contentful paint < 1.5s
- Time to interactive < 2s
- Search response < 200ms

## Migration Steps

1. Build new components in isolation
2. Test thoroughly
3. Soft launch behind feature flag
4. Gather feedback
5. Full rollout

## Notes for Implementation

- USE EXISTING TYPES from /papers and /search
- REUSE UI components where possible without modification
- MAINTAIN separation between browsing and annotation features
- TEST each phase thoroughly before proceeding
- DOCUMENT all new components and interfaces
- VERIFY mobile responsiveness at each step

## Success Criteria

- Clean, intuitive UI matching site theme
- Fast, responsive search
- Seamless PDF viewer integration
- No regression in existing features
- Positive user feedback

## Next Steps

Begin with Phase 1 implementation and await feedback before proceeding to subsequent phases.
