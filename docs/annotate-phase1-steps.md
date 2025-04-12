# Annotate Page Phase 1 Implementation Steps

## Initial Setup

### 1. Create Directory Structure

```bash
mkdir -p src/components/annotate/{layout,browser,search}
touch src/components/annotate/layout/{index.ts,Header.tsx,Sidebar.tsx,MainContent.tsx}
```

### 2. Update Layout Files

First, create the layout components:

```typescript
// src/components/annotate/layout/index.ts
export * from "./Header";
export * from "./Sidebar";
export * from "./MainContent";
```

Then implement each component following these steps:

## Implementation Order

### Step 1: Layout Components

1. **Header Component**

```typescript
// src/components/annotate/layout/Header.tsx
import { SearchBox } from "@/components/search/SearchBox";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/annotate" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Annotate Papers
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBox />
          </div>
        </div>
      </div>
    </header>
  );
}
```

2. **Sidebar Component**

```typescript
// src/components/annotate/layout/Sidebar.tsx
interface SidebarProps {
  children?: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={`${className} hidden border-r bg-background md:block`}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Subjects
          </h2>
          <div className="space-y-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

3. **MainContent Component**

```typescript
// src/components/annotate/layout/MainContent.tsx
interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <div className="container h-full py-6">{children}</div>
    </main>
  );
}
```

### Step 2: Update Root Layout

```typescript
// src/app/annotate/layout.tsx
import { Header, Sidebar, MainContent } from "@/components/annotate/layout";

export default function AnnotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
```

### Step 3: Add Types

```typescript
// types/annotate.ts
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SidebarNavItem extends NavItem {
  items?: NavItem[];
}
```

## Testing

### 1. Component Tests

```typescript
// __tests__/components/annotate/layout/Header.test.tsx
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/annotate/layout/Header";

describe("Header", () => {
  it("renders correctly", () => {
    render(<Header />);
    expect(screen.getByText("Annotate Papers")).toBeInTheDocument();
  });
});
```

### 2. Layout Tests

```typescript
// __tests__/app/annotate/layout.test.tsx
import { render } from "@testing-library/react";
import AnnotateLayout from "@/app/annotate/layout";

describe("AnnotateLayout", () => {
  it("renders children correctly", () => {
    const { container } = render(
      <AnnotateLayout>
        <div>Test Content</div>
      </AnnotateLayout>
    );
    expect(container).toBeInTheDocument();
  });
});
```

## Styling Guide

Use these consistent class patterns:

```typescript
const styles = {
  // Layout
  page: "relative flex min-h-screen flex-col",
  container: "container mx-auto px-4",

  // Header
  header: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur",
  headerInner: "container flex h-14 items-center",

  // Sidebar
  sidebar: "hidden border-r bg-background md:block",
  sidebarSection: "space-y-4 py-4",

  // Main Content
  main: "flex-1 overflow-hidden",
  mainInner: "container h-full py-6",
};
```

## Validation Steps

1. **Visual Checklist**

- [ ] Header is sticky and blurred
- [ ] Sidebar shows on desktop, hidden on mobile
- [ ] Content area scrolls independently
- [ ] Proper spacing between elements
- [ ] Consistent with design system

2. **Functionality Checklist**

- [ ] Navigation links work
- [ ] Search box functions
- [ ] Responsive layout works
- [ ] No layout shifts
- [ ] Proper focus management

3. **Accessibility Checklist**

- [ ] Proper heading hierarchy
- [ ] ARIA landmarks
- [ ] Keyboard navigation
- [ ] Skip links
- [ ] Color contrast

## Next Steps

After implementing the layout:

1. Test responsive behavior thoroughly
2. Add loading states
3. Implement error boundaries
4. Add analytics tracking
5. Document component props
6. Create usage examples

## Notes

- Keep components pure and functional
- Use TypeScript strictly
- Follow existing naming conventions
- Maintain consistent spacing
- Document all props and behaviors
