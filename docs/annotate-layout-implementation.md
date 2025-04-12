# Annotate Page Layout Implementation

## File Structure

```
src/
  components/
    annotate/
      layout/
        index.tsx       # Re-exports all layout components
        Header.tsx      # Main navigation header
        Sidebar.tsx     # Subject navigation
        MainContent.tsx # Content wrapper
  app/
    annotate/
      layout.tsx       # Root layout implementation
```

## Component Implementation Steps

### 1. Create Layout Index

```typescript
// src/components/annotate/layout/index.tsx

export { Header } from "./Header";
export { Sidebar } from "./Sidebar";
export { MainContent } from "./MainContent";
```

### 2. Layout Components Creation

#### Header Implementation

```typescript
// src/components/annotate/layout/Header.tsx

import { SearchBox } from "@/components/search/SearchBox";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <a href="/annotate" className="flex items-center space-x-2">
            <span className="font-bold">Annotate Papers</span>
          </a>
        </div>

        {/* Search Section */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="w-full max-w-xl">
            <SearchBox />
          </div>
          <Button variant="outline" size="sm">
            Filter
          </Button>
        </div>
      </div>
    </header>
  );
};
```

#### Updated Layout Implementation

```typescript
// src/app/annotate/layout.tsx

import { Header, Sidebar, MainContent } from "@/components/annotate/layout";
import { getSubjects } from "@/lib/data"; // Implement this data fetching function

export default async function AnnotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch subjects data
  const subjects = await getSubjects();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar subjects={subjects} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
```

## Data Types

```typescript
// types/annotate.ts

export interface Subject {
  id: string;
  name: string;
  units: number;
  icon?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}
```

## Data Fetching

```typescript
// lib/data.ts

import { Subject } from "@/types/annotate";

export async function getSubjects(): Promise<Subject[]> {
  // Implementation will depend on your data source
  return [
    {
      id: "physics",
      name: "Physics",
      units: 6,
      icon: "/icons/physics.svg",
    },
    // ... other subjects
  ];
}
```

## Theme Classes Reference

```css
/* Common theme classes used */

.bg-background {
  /* Your theme background color */
}

.bg-background\/95 {
  /* Semi-transparent background */
}

.border-b {
  border-bottom-width: 1px;
}

.container {
  max-width: var(--container-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}
```

## Testing Plan

1. Unit Tests

```typescript
// __tests__/components/annotate/layout/Header.test.tsx

import { render, screen } from "@testing-library/react";
import { Header } from "@/components/annotate/layout/Header";

describe("Header", () => {
  it("renders logo and search", () => {
    render(<Header />);
    expect(screen.getByText("Annotate Papers")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });
});
```

2. Integration Tests

```typescript
// __tests__/app/annotate/layout.test.tsx

import { render, screen } from "@testing-library/react";
import AnnotateLayout from "@/app/annotate/layout";

describe("AnnotateLayout", () => {
  it("renders all sections", async () => {
    render(
      <AnnotateLayout>
        <div>Test Content</div>
      </AnnotateLayout>
    );

    expect(screen.getByRole("banner")).toBeInTheDocument(); // Header
    expect(screen.getByRole("complementary")).toBeInTheDocument(); // Sidebar
    expect(screen.getByRole("main")).toBeInTheDocument(); // MainContent
  });
});
```

## Implementation Order

1. Create base layout files and types
2. Implement Header component
3. Add basic Sidebar structure
4. Set up MainContent wrapper
5. Integrate components in layout.tsx
6. Add data fetching
7. Implement tests
8. Add animations and transitions
9. Polish responsive behavior

## Responsive Considerations

- Header maintains sticky position on all screens
- Sidebar collapses to drawer on mobile
- Search bar adapts width based on viewport
- Proper spacing adjustments on different breakpoints

## Error Handling

```typescript
// components/annotator/layout/error.tsx

export default function AnnotateError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

## Next Steps

1. Create the directory structure
2. Implement base components
3. Add data fetching logic
4. Set up tests
5. Review and refine
