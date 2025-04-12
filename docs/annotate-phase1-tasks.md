# Annotate Page Phase 1 - Initial Tasks

## 🎯 Getting Started

### 1. Setup Project Structure

```bash
# Create directories
mkdir -p src/components/annotate/{layout,browser,search}
mkdir -p src/app/annotate/[subject]
mkdir -p src/store
mkdir -p src/types
mkdir -p src/__tests__/components/annotate
```

### 2. Initial Files to Create

```typescript
// Create these files in order:

1. src/types/annotate.ts
   - Define base types
   - Export interfaces

2. src/store/annotateStore.ts
   - Set up Zustand store
   - Define actions

3. src/components/annotate/layout/index.ts
   - Create barrel file
   - Export components

4. src/components/annotate/layout/Header.tsx
   - Basic header structure
   - Search integration

5. src/components/annotate/layout/Sidebar.tsx
   - Subject navigation
   - Mobile drawer

6. src/components/annotate/layout/MainContent.tsx
   - Content wrapper
   - Scroll handling

7. src/app/annotate/layout.tsx
   - Root layout
   - Component integration

8. src/app/annotate/page.tsx
   - Main page structure
   - Subject grid
```

## 📝 First Sprint Tasks

### Layout Components

1. **Header Component**

- [ ] Create basic structure
- [ ] Add search box placeholder
- [ ] Make responsive
- [ ] Add theme classes
- [ ] Write tests

2. **Sidebar Component**

- [ ] Implement basic structure
- [ ] Add subject list
- [ ] Make collapsible
- [ ] Add mobile drawer
- [ ] Write tests

3. **MainContent Component**

- [ ] Create wrapper
- [ ] Add scroll container
- [ ] Handle resize
- [ ] Write tests

### Type Definitions

```typescript
// src/types/annotate.ts

export interface Subject {
  id: string;
  name: string;
  units: number;
  icon?: string;
}

export interface Paper {
  id: string;
  title: string;
  subject: string;
  unit: string;
  year: number;
  season: string;
  pdfUrl: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}
```

### Store Setup

```typescript
// src/store/annotateStore.ts

import create from "zustand";

interface AnnotateState {
  currentSubject: string | null;
  searchQuery: string;
  sidebarOpen: boolean;
}

export const useAnnotateStore = create<AnnotateState>((set) => ({
  currentSubject: null,
  searchQuery: "",
  sidebarOpen: true,
}));
```

## 🧪 Initial Tests

```typescript
// __tests__/components/annotate/layout/Header.test.tsx
import { render } from "@testing-library/react";
import { Header } from "@/components/annotate/layout/Header";

describe("Header", () => {
  it("renders correctly", () => {
    const { container } = render(<Header />);
    expect(container).toBeInTheDocument();
  });
});
```

## 🎨 Theme Classes to Use

```typescript
const layoutClasses = {
  header: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur",
  sidebar: "hidden border-r bg-background md:block w-[240px]",
  main: "flex-1 overflow-auto",
  container: "container mx-auto px-4 h-full",
};
```

## 📋 Validation Steps

### 1. Directory Structure

- [ ] All directories created
- [ ] File naming consistent
- [ ] Import paths working

### 2. Component Setup

- [ ] Components render
- [ ] Props typed
- [ ] Basic styling applied
- [ ] No console errors

### 3. Type System

- [ ] Types defined
- [ ] Exports working
- [ ] No any types
- [ ] Good documentation

### 4. Store Integration

- [ ] Store initialized
- [ ] Actions working
- [ ] State updates clean
- [ ] Dev tools working

## 🚨 Common Issues to Watch

1. **TypeScript Config**

   - Check paths in tsconfig
   - Verify imports resolve
   - Enable strict mode

2. **Component Loading**

   - Handle SSR properly
   - Add loading states
   - Error boundaries

3. **State Management**
   - Clean store updates
   - Prevent re-renders
   - Handle side effects

## 📈 Success Metrics

### Phase 1 Components

- [ ] All components render
- [ ] Responsive layout works
- [ ] No TypeScript errors
- [ ] Tests passing
- [ ] Good coverage
- [ ] Performance good

### Code Quality

- [ ] ESLint clean
- [ ] Prettier formatted
- [ ] Comments added
- [ ] Types complete
- [ ] Tests written

## 🔄 Next Steps

After completing these tasks:

1. Review implementation
2. Run all tests
3. Check performance
4. Update documentation
5. Plan Phase 2 tasks

## 📝 Notes

- Keep components simple initially
- Focus on structure first
- Add features incrementally
- Document as you go
- Test thoroughly
- Maintain TypeScript strictness
