# Annotate Page Test Plan

## Testing Structure

```
src/
  __tests__/
    components/
      annotate/
        layout/
          Header.test.tsx
          Sidebar.test.tsx
          MainContent.test.tsx
        browser/
          SubjectGrid.test.tsx
          UnitList.test.tsx
        search/
          SearchContainer.test.tsx
    app/
      annotate/
        layout.test.tsx
        page.test.tsx
```

## Test Categories

### 1. Unit Tests

#### Layout Components

```typescript
// Header.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/annotate/layout/Header";

describe("Header", () => {
  it("renders logo and navigation", () => {
    render(<Header />);
    expect(screen.getByText("Annotate Papers")).toBeInTheDocument();
  });

  it("handles search input", () => {
    render(<Header />);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "physics" } });
    expect(searchInput).toHaveValue("physics");
  });
});

// Sidebar.test.tsx
describe("Sidebar", () => {
  it("renders subject list", () => {
    const subjects = [{ id: "1", name: "Physics", units: 6 }];
    render(<Sidebar subjects={subjects} />);
    expect(screen.getByText("Physics")).toBeInTheDocument();
  });

  it("handles subject selection", () => {
    const onSelect = jest.fn();
    render(<Sidebar subjects={[]} onSelect={onSelect} />);
    // Test selection handling
  });
});
```

### 2. Integration Tests

```typescript
// annotate/page.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import AnnotatePage from "@/app/annotate/page";

describe("AnnotatePage", () => {
  it("loads and displays subjects", async () => {
    render(<AnnotatePage />);
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  it("integrates search with results", async () => {
    render(<AnnotatePage />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "physics" } });
    await waitFor(() => {
      expect(screen.getByText("Physics Papers")).toBeInTheDocument();
    });
  });
});
```

### 3. Component Interaction Tests

```typescript
describe("SearchAndFilter", () => {
  it("updates results when filters change", async () => {
    render(<SearchContainer />);
    const yearFilter = screen.getByLabelText("Year");
    fireEvent.click(yearFilter);
    await waitFor(() => {
      expect(screen.getByText("Filtered Results")).toBeInTheDocument();
    });
  });
});
```

### 4. State Management Tests

```typescript
// store/annotateStore.test.ts
import { renderHook, act } from "@testing-library/react";
import { useAnnotateStore } from "@/store/annotateStore";

describe("annotateStore", () => {
  it("updates search state", () => {
    const { result } = renderHook(() => useAnnotateStore());
    act(() => {
      result.current.updateSearch("test query");
    });
    expect(result.current.searchQuery).toBe("test query");
  });

  it("handles filter updates", () => {
    const { result } = renderHook(() => useAnnotateStore());
    act(() => {
      result.current.updateFilters({ subjects: ["physics"] });
    });
    expect(result.current.filters.subjects).toContain("physics");
  });
});
```

### 5. URL Integration Tests

```typescript
import { useAnnotateNavigation } from "@/lib/navigation";

describe("URL Navigation", () => {
  it("syncs URL with state", async () => {
    const { result } = renderHook(() => useAnnotateNavigation());
    act(() => {
      result.current.updateURL({ subject: "physics" });
    });
    expect(window.location.search).toContain("subject=physics");
  });
});
```

### 6. Accessibility Tests

```typescript
describe("Accessibility", () => {
  it("maintains focus management", () => {
    render(<AnnotatePage />);
    const search = screen.getByRole("searchbox");
    search.focus();
    expect(document.activeElement).toBe(search);
  });

  it("handles keyboard navigation", () => {
    render(<AnnotatePage />);
    const firstButton = screen.getByRole("button");
    fireEvent.keyDown(firstButton, { key: "Tab" });
    expect(document.activeElement).not.toBe(firstButton);
  });
});
```

### 7. Performance Tests

```typescript
describe("Performance", () => {
  it("debounces search input", async () => {
    jest.useFakeTimers();
    const searchFn = jest.fn();
    render(<SearchBox onSearch={searchFn} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "test" },
    });

    expect(searchFn).not.toBeCalled();
    jest.runAllTimers();
    expect(searchFn).toBeCalledWith("test");
  });
});
```

## Test Environment Setup

```typescript
// jest.setup.ts
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});
```

## Mock Data

```typescript
// mocks/data.ts
export const mockSubjects = [
  {
    id: "physics",
    name: "Physics",
    units: 6,
    icon: "/icons/physics.svg",
  },
  // ... more subjects
];

export const mockPapers = [
  {
    id: "p1",
    title: "Physics Unit 1 2024",
    subject: "physics",
    unit: "unit1",
    year: 2024,
    season: "Summer",
  },
  // ... more papers
];
```

## Testing Checklist

### Component Testing

- [ ] Renders correctly
- [ ] Handles all props
- [ ] Manages state correctly
- [ ] Handles user interactions
- [ ] Displays loading states
- [ ] Shows error states
- [ ] Responsive behavior

### Integration Testing

- [ ] Components work together
- [ ] Data flows correctly
- [ ] URL updates properly
- [ ] State syncs across components
- [ ] Error boundaries catch issues

### Accessibility Testing

- [ ] ARIA roles present
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Color contrast valid
- [ ] Screen reader friendly

### Performance Testing

- [ ] Renders efficiently
- [ ] Handles large datasets
- [ ] Debounces where needed
- [ ] Memoizes appropriately
- [ ] No memory leaks

## Test Execution

```bash
# Run all tests
npm test

# Run specific test file
npm test Header.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```
