# Implementation Patterns and Best Practices

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [Navigation and Routing](#navigation-and-routing)
4. [Data Fetching](#data-fetching)
5. [Theme System](#theme-system)
6. [Search Implementation](#search-implementation)
7. [Common Patterns](#common-patterns)

## Component Architecture

### Layout Components

Layout components use a nested structure for consistent page layouts:

```tsx
// src/components/layout/MainLayout.tsx
export default function MainLayout({ children }) {
  return (
    <>
      <MainNav />
      <main className="min-h-screen pt-16 bg-background">{children}</main>
    </>
  );
}
```

### Search Components

Search functionality is implemented with transitions and state management:

```tsx
// src/components/layout/NavSearch.tsx
export default function NavSearch() {
  const { inputRef, isTransitioning, handleSearch } = useSearchTransition();
  const [isFocused, setIsFocused] = useState(false);

  // Search implementation...
}
```

### Theme Implementation

Theme switching is handled through a global context and CSS variables:

```tsx
// src/hooks/useTheme.tsx
export function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
```

## State Management

### Global State

Auth and theme state are managed through React Context:

```tsx
// src/components/auth/AuthContext.tsx
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});
```

### Local State

Component state uses hooks with TypeScript:

```tsx
interface State {
  isLoading: boolean;
  error: string | null;
  data: Data | null;
}

const initialState: State = {
  isLoading: false,
  error: null,
  data: null,
};
```

## Navigation and Routing

### Route Transitions

Smooth transitions between routes:

```tsx
// src/hooks/useSearchTransition.ts
export function useSearchTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNavigation = useCallback(
    (path: string) => {
      setIsTransitioning(true);
      router.push(path);
    },
    [router]
  );
}
```

### Protected Routes

Role-based access control:

```tsx
// src/components/auth/ProtectedRoute.tsx
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user || user.role !== requiredRole) {
    return <AccessDenied />;
  }

  return children;
}
```

## Data Fetching

### API Requests

Centralized API client with error handling:

```tsx
// src/lib/api.ts
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.statusText);
  }

  return response.json();
}
```

### Data Caching

Client-side caching implementation:

```tsx
// src/hooks/useCache.ts
export function useCache<T>(key: string, fetcher: () => Promise<T>) {
  const cache = useRef(new Map());

  return useMemo(
    () => ({
      get: () => cache.current.get(key),
      set: (data: T) => cache.current.set(key, data),
      clear: () => cache.current.delete(key),
    }),
    [key]
  );
}
```

## Theme System

### Theme Configuration

Theme definitions with TypeScript:

```tsx
// src/types/theme.ts
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
}
```

### Theme Application

Runtime theme switching:

```tsx
// src/hooks/useTheme.ts
export function useTheme() {
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, []);
}
```

## Search Implementation

### Search Transitions

Smooth search experience:

```tsx
// src/hooks/useSearchTransition.ts
export function useSearchTransition() {
  const handleSearch = useCallback(
    (query: string) => {
      // Update URL
      const params = new URLSearchParams();
      params.set("q", query);

      // Navigate with transition
      setIsTransitioning(true);
      router.push(`/search?${params.toString()}`);
    },
    [router]
  );
}
```

### Search Results

Type-safe search results:

```tsx
// src/types/search.ts
interface SearchResult {
  id: string;
  title: string;
  type: "paper" | "book" | "note";
  matchScore: number;
  metadata: Record<string, unknown>;
}
```

## Common Patterns

### Error Boundaries

Error handling wrapper:

```tsx
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Loading States

Consistent loading indicators:

```tsx
// src/components/LoadingState.tsx
export function LoadingState({ size = "md" }: LoadingProps) {
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size={size} />
    </div>
  );
}
```

### Form Handling

Reusable form logic:

```tsx
// src/hooks/useForm.ts
export function useForm<T>(options: FormOptions<T>) {
  const [data, setData] = useState<T>(options.initialData);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const validate = useCallback(() => {
    const validationErrors = options.validate(data);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [data, options]);

  return {
    data,
    errors,
    setData,
    validate,
  };
}
```

### Modal Management

Centralized modal management:

```tsx
// src/hooks/useModal.ts
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    open,
    close,
  };
}
```
