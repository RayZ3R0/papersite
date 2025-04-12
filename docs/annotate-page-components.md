# Annotate Page Components - Phase 1 Implementation Details

## Layout Components

### Header Component

```typescript
// src/components/annotate/layout/Header.tsx

import { SearchBox } from "@/components/search/SearchBox";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a href="/annotate" className="flex items-center space-x-2">
            <span className="font-bold">Annotate Papers</span>
          </a>
        </div>
        <div className="flex flex-1 items-center space-x-2">
          <SearchBox />
        </div>
      </div>
    </header>
  );
};
```

### Sidebar Component

```typescript
// src/components/annotate/layout/Sidebar.tsx

interface SidebarProps {
  subjects: Array<{
    id: string;
    name: string;
    units: number;
  }>;
}

export const Sidebar = ({ subjects }: SidebarProps) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background/80">
      <nav className="flex h-full flex-col">
        <div className="flex-1 overflow-auto py-4">
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold">Subjects</h2>
          </div>
          <div className="space-y-1 px-2">
            {subjects.map((subject) => (
              <SubjectItem key={subject.id} {...subject} />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

const SubjectItem = ({ id, name, units }: SidebarProps["subjects"][0]) => {
  return (
    <a
      href={`/annotate/${id}`}
      className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
    >
      <span className="flex-1">{name}</span>
      <span className="text-muted-foreground">{units}</span>
    </a>
  );
};
```

### MainContent Component

```typescript
// src/components/annotate/layout/MainContent.tsx

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="flex-1 overflow-auto">
      <div className="container py-6">{children}</div>
    </main>
  );
};
```

## Browser Components

### SubjectGrid Component

```typescript
// src/components/annotate/browser/SubjectGrid.tsx

import type { SubjectData } from "@/types/annotate";

interface SubjectGridProps {
  subjects: SubjectData[];
}

export const SubjectGrid = ({ subjects }: SubjectGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard key={subject.id} {...subject} />
      ))}
    </div>
  );
};

const SubjectCard = ({ id, name, units, icon }: SubjectData) => {
  return (
    <a
      href={`/annotate/${id}`}
      className="group relative rounded-lg border p-6 hover:bg-accent"
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <img src={icon} alt={name} className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {units.length} Units
        </p>
      </div>
    </a>
  );
};
```

### UnitList Component

```typescript
// src/components/annotate/browser/UnitList.tsx

import type { UnitData } from "@/types/annotate";

interface UnitListProps {
  units: UnitData[];
  subjectId: string;
}

export const UnitList = ({ units, subjectId }: UnitListProps) => {
  return (
    <div className="space-y-6">
      {units.map((unit) => (
        <UnitSection key={unit.id} {...unit} subjectId={subjectId} />
      ))}
    </div>
  );
};

const UnitSection = ({
  id,
  name,
  papers,
  subjectId,
}: UnitData & { subjectId: string }) => {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">{name}</h3>
        <span className="text-sm text-muted-foreground">
          {papers.length} Papers
        </span>
      </div>
      <div className="border-t">
        {papers.map((paper) => (
          <PaperItem key={paper.id} {...paper} />
        ))}
      </div>
    </div>
  );
};
```

### PaperCard Component

```typescript
// src/components/annotate/browser/PaperCard.tsx

import type { PaperPreview } from "@/types/annotate";

interface PaperCardProps extends PaperPreview {
  compact?: boolean;
}

export const PaperCard = ({
  id,
  title,
  year,
  season,
  pdfUrl,
  thumbnailUrl,
  compact,
}: PaperCardProps) => {
  return (
    <div
      className={`group relative ${compact ? "p-3" : "p-4"} hover:bg-accent/50`}
    >
      <div className="flex items-start gap-4">
        {thumbnailUrl && (
          <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border">
            <img src={thumbnailUrl} alt={title} className="object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h4 className="font-medium leading-none">{title}</h4>
          <p className="text-sm text-muted-foreground">
            {season} {year}
          </p>
        </div>
        <a
          href={`/annotate/view?pdf=${encodeURIComponent(pdfUrl)}`}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
        >
          <span className="sr-only">Open paper</span>
          {/* Add icon here */}
        </a>
      </div>
    </div>
  );
};
```

## Search Components

### SearchContainer Component

```typescript
// src/components/annotate/search/SearchContainer.tsx

import { FilterBox } from "@/components/search/FilterBox";
import { PaperSearch } from "@/components/search/PaperSearch";

export const SearchContainer = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <PaperSearch />
        </div>
        <FilterBox />
      </div>
      <div className="h-px bg-border" />
    </div>
  );
};
```

## Implementation Notes

1. Component Architecture

- All components are functional components with TypeScript
- Props are explicitly typed
- Components follow atomic design principles
- Reuse existing search components where possible

2. Styling Guidelines

- Use existing theme classes
- Follow BEM naming for custom classes
- Maintain dark mode compatibility
- Keep responsive design in mind

3. Accessibility Considerations

- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- Focus management

4. Performance Optimizations

- Lazy load images
- Memoize expensive computations
- Use windowing for long lists
- Implement proper loading states

5. Testing Approach

- Unit tests for each component
- Integration tests for component combinations
- Snapshot testing for UI consistency
- Accessibility testing

6. Documentation Requirements

- Props documentation
- Usage examples
- Component stories
- Performance notes
