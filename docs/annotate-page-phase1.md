# Annotate Page Enhancement - Phase 1 Implementation

## Current Structure Analysis

- /annotate currently has basic layout.tsx and page.tsx
- Search components available:
  - FilterBox.tsx
  - PaperSearch.tsx
  - SearchBox.tsx
  - SimpleSearch.tsx
- Papers section uses dynamic [subject] routing

## Phase 1 Implementation Plan

### 1. Directory Structure Setup

```
src/
  components/
    annotate/
      layout/
        Header.tsx
        Sidebar.tsx
        MainContent.tsx
      browser/
        SubjectGrid.tsx
        UnitList.tsx
        PaperCard.tsx
        GridLayout.tsx
      search/
        SearchContainer.tsx
        FilterPanel.tsx
        ResultsList.tsx

  app/
    annotate/
      layout.tsx       (enhanced)
      page.tsx        (enhanced)
      [subject]/
        page.tsx      (new)
```

### 2. Component Implementation Order

#### A. Layout Components

1. `Header.tsx`

   ```typescript
   export const Header = () => {
     return (
       <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
         {/* Search bar and navigation */}
       </header>
     );
   };
   ```

2. `Sidebar.tsx`

   ```typescript
   export const Sidebar = () => {
     return (
       <aside className="w-64 border-r bg-background/80">
         {/* Subject/unit navigation */}
       </aside>
     );
   };
   ```

3. `MainContent.tsx`
   ```typescript
   export const MainContent = () => {
     return (
       <main className="flex-1 overflow-auto">
         {/* Dynamic content area */}
       </main>
     );
   };
   ```

#### B. Browser Components

1. `SubjectGrid.tsx`

   - Grid layout matching papers page
   - Subject cards with thumbnails
   - Click handling for navigation

2. `UnitList.tsx`

   - Collapsible unit sections
   - Paper listings per unit
   - Smooth animations

3. `PaperCard.tsx`

   - Thumbnail preview
   - Paper metadata
   - Action buttons

4. `GridLayout.tsx`
   - Responsive grid system
   - Handles layout switching

### 3. Integration Steps

1. Update layout.tsx

```typescript
import { Header, Sidebar, MainContent } from "../components/annotate/layout";

export default function AnnotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
```

2. Update page.tsx

```typescript
import { SubjectGrid } from "../components/annotate/browser";
import { SearchContainer } from "../components/annotate/search";

export default function AnnotatePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <SearchContainer />
      <SubjectGrid />
    </div>
  );
}
```

### 4. Type Definitions

```typescript
// types/annotate.ts

export interface PaperPreview {
  id: string;
  title: string;
  subject: string;
  unit: string;
  year: number;
  season: string;
  pdfUrl: string;
  thumbnailUrl?: string;
}

export interface SubjectData {
  id: string;
  name: string;
  units: UnitData[];
  icon?: string;
}

export interface UnitData {
  id: string;
  name: string;
  papers: PaperPreview[];
}
```

### 5. Theme Integration

- Use existing theme classes from papers section
- Common class patterns:
  ```
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
  card: "rounded-lg border bg-card text-card-foreground shadow"
  grid: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
  ```

## Testing Plan

1. Component unit tests
2. Layout responsiveness tests
3. Navigation flow tests
4. Performance benchmarks

## Success Criteria for Phase 1

- [ ] All components render correctly
- [ ] Responsive on all screen sizes
- [ ] Smooth navigation between views
- [ ] Proper theme integration
- [ ] Type safety throughout
- [ ] No regressions in existing features

## Next Steps

1. Implement layout components
2. Basic routing structure
3. Subject grid implementation
4. Integration testing
5. Get approval before Phase 2

## Notes

- Keep existing PDF annotation features untouched
- Maintain separation of concerns
- Use existing theme classes
- Document all components
- Test mobile responsiveness
