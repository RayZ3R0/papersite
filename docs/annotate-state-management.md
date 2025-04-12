# Annotate Page State Management

## Overview

This document outlines the state management strategy for the annotate page, defining how data flows between components and how user interactions are handled.

## State Structure

### Global State (Using Zustand)

```typescript
// store/annotateStore.ts

import create from "zustand";

interface AnnotateState {
  // Navigation State
  currentSubject: string | null;
  currentUnit: string | null;

  // Search State
  searchQuery: string;
  filters: {
    subjects: string[];
    years: number[];
    seasons: string[];
  };

  // UI State
  sidebarOpen: boolean;
  loading: boolean;

  // Actions
  setCurrentSubject: (subject: string | null) => void;
  setCurrentUnit: (unit: string | null) => void;
  updateSearch: (query: string) => void;
  updateFilters: (filters: Partial<AnnotateState["filters"]>) => void;
  toggleSidebar: () => void;
}

export const useAnnotateStore = create<AnnotateState>((set) => ({
  // Initial State
  currentSubject: null,
  currentUnit: null,
  searchQuery: "",
  filters: {
    subjects: [],
    years: [],
    seasons: [],
  },
  sidebarOpen: true,
  loading: false,

  // Actions
  setCurrentSubject: (subject) => set({ currentSubject: subject }),
  setCurrentUnit: (unit) => set({ currentUnit: unit }),
  updateSearch: (query) => set({ searchQuery: query }),
  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### URL State Management

```typescript
// lib/navigation.ts

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useAnnotateNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateURL = (updates: {
    subject?: string;
    unit?: string;
    search?: string;
    filters?: Record<string, string[]>;
  }) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  return {
    updateURL,
    currentParams: {
      subject: searchParams.get("subject"),
      unit: searchParams.get("unit"),
      search: searchParams.get("search"),
      filters: Object.fromEntries(searchParams.entries()),
    },
  };
}
```

## Component State Integration

### Layout Components

```typescript
// components/annotate/layout/Header.tsx

export const Header = () => {
  const { searchQuery, updateSearch } = useAnnotateStore();
  const { updateURL } = useAnnotateNavigation();

  const handleSearch = (query: string) => {
    updateSearch(query);
    updateURL({ search: query });
  };

  return (
    // ... header implementation with search handling
  );
};
```

### Search Components

```typescript
// components/annotate/search/SearchContainer.tsx

export const SearchContainer = () => {
  const { filters, updateFilters } = useAnnotateStore();
  const { updateURL } = useAnnotateNavigation();

  const handleFilterChange = (newFilters: typeof filters) => {
    updateFilters(newFilters);
    updateURL({ filters: newFilters });
  };

  return (
    // ... search container implementation
  );
};
```

## State Synchronization

### URL with Store Sync

```typescript
// hooks/useURLSync.ts

import { useEffect } from "react";
import { useAnnotateStore } from "@/store/annotateStore";
import { useAnnotateNavigation } from "@/lib/navigation";

export function useURLSync() {
  const { currentParams } = useAnnotateNavigation();
  const { setCurrentSubject, setCurrentUnit, updateSearch, updateFilters } =
    useAnnotateStore();

  useEffect(() => {
    // Sync URL parameters to store
    if (currentParams.subject) {
      setCurrentSubject(currentParams.subject);
    }
    if (currentParams.unit) {
      setCurrentUnit(currentParams.unit);
    }
    if (currentParams.search) {
      updateSearch(currentParams.search);
    }
    // ... handle other params
  }, [currentParams]);
}
```

## Loading States

```typescript
// hooks/useLoadingState.ts

import { useAnnotateStore } from "@/store/annotateStore";

export function useLoadingState() {
  const setLoading = useAnnotateStore((state) => state.setLoading);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  return { withLoading };
}
```

## Error Handling

```typescript
// types/errors.ts

export class AnnotateError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = "AnnotateError";
  }
}

// hooks/useErrorHandling.ts

import { toast } from "@/components/ui/toast";

export function useErrorHandling() {
  const handleError = (error: unknown) => {
    if (error instanceof AnnotateError) {
      toast({
        title: "Error",
        description: error.message,
        variant: error.recoverable ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleError };
}
```

## Performance Optimizations

1. State Selectors

```typescript
// Selective re-renders
const searchQuery = useAnnotateStore((state) => state.searchQuery);
const filters = useAnnotateStore((state) => state.filters);
```

2. Memoization

```typescript
const memoizedFilters = useMemo(() => {
  return processFilters(filters);
}, [filters]);
```

3. Debounced Search

```typescript
const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      updateSearch(query);
    }, 300),
  []
);
```

## Testing Considerations

1. Store Testing

```typescript
describe("annotateStore", () => {
  it("updates search query", () => {
    const { result } = renderHook(() => useAnnotateStore());
    act(() => {
      result.current.updateSearch("test");
    });
    expect(result.current.searchQuery).toBe("test");
  });
});
```

2. URL Sync Testing

```typescript
describe("useURLSync", () => {
  it("syncs URL params to store", () => {
    // Test URL parameter synchronization
  });
});
```

## Implementation Notes

1. State Updates

- Always use store actions for state updates
- Keep URL in sync with store state
- Handle loading states appropriately

2. Error Handling

- Use error boundaries for component errors
- Handle async errors in actions
- Show appropriate error messages

3. Performance

- Use selectors to prevent unnecessary re-renders
- Implement request debouncing
- Cache results where appropriate
