# Component and API Structure Documentation

## Component Organization

### Layout and Navigation

```
src/components/layout/
├── MainNav/             # Main navigation bar
│   ├── MainNav.tsx
│   ├── NavSearch.tsx   # Search component in nav
│   └── NavLinks.tsx    # Navigation links
├── MobileNav/          # Mobile navigation
├── ThemePicker/        # Theme selection
└── icons.tsx          # Shared icons
```

### Search System

Current search implementation uses:

1. Global search bar in navigation
2. Home page search
3. Advanced search page
4. Search transitions and animations

Key Components:

```typescript
// NavSearch Component
interface NavSearchProps {
  placeholder?: string;
  className?: string;
}

// Search Box Component
interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// Search Results
interface SearchResultProps {
  results: SearchResult[];
  isLoading: boolean;
  onResultClick?: (result: SearchResult) => void;
}
```

### Authentication Components

```
src/components/auth/
├── LoginForm/
│   ├── LoginForm.tsx
│   └── useLoginForm.ts
├── RegisterForm/
├── AuthContext.tsx
├── ProtectedRoute.tsx
└── types.ts
```

### Forum Components

```
src/components/forum/
├── PostList/
├── PostEditor/
├── Comments/
└── Moderation/
```

## API Structure

### Authentication APIs

```typescript
// Authentication Endpoints
const AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  verify: "/api/auth/verify",
  resetPassword: "/api/auth/reset-password",
} as const;

// Response Types
interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

### Profile APIs

```typescript
// Profile Endpoints
const PROFILE_ENDPOINTS = {
  get: "/api/profile",
  update: "/api/profile",
  subjects: "/api/profile/subjects",
  preferences: "/api/profile/preferences",
} as const;

// Request/Response Types
interface UpdateProfileRequest {
  name?: string;
  email?: string;
  subjects?: string[];
  preferences?: UserPreferences;
}
```

### Search APIs

```typescript
// Search Endpoints
const SEARCH_ENDPOINTS = {
  search: "/api/search",
  suggestions: "/api/search/suggestions",
  filters: "/api/search/filters",
} as const;

// Request Types
interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}
```

## Database Models

### User Model

```typescript
interface UserModel {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  subjects: SubjectReference[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subject Model

```typescript
interface SubjectModel {
  _id: ObjectId;
  code: string;
  name: string;
  units: UnitReference[];
  papers: PaperReference[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Component Communication

### Context Usage

```typescript
// Theme Context
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

// Auth Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});
```

### Props Interface Standards

```typescript
// Common Props Interface
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Component Props
interface ComponentProps extends BaseProps {
  title: string;
  description?: string;
  onAction?: () => void;
}
```

## Component Lifecycle

### Mount Behavior

```typescript
useEffect(() => {
  // Setup
  return () => {
    // Cleanup
  };
}, []);
```

### Update Behavior

```typescript
useEffect(() => {
  // Handle prop changes
}, [propValue]);
```

## Error Handling

### API Error Handling

```typescript
interface ApiError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// Error Handler
const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    // Handle API error
    return;
  }
  // Handle unknown error
};
```

### Component Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
  }
}
```

## State Management

### Local State

```typescript
// Component State
const [state, setState] = useState<State>({
  isLoading: false,
  error: null,
  data: null,
});

// Complex State
const [state, dispatch] = useReducer(reducer, initialState);
```

### Global State

```typescript
// Auth State
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth methods...
};
```

## Performance Optimization

### Memoization

```typescript
// Memoized Value
const memoizedValue = useMemo(() => computeValue(prop), [prop]);

// Memoized Callback
const memoizedCallback = useCallback(() => {
  // Handle action
}, [dependency]);
```

### Component Optimization

```typescript
// Memoized Component
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return isEqual(prevProps, nextProps);
});
```

## Testing Patterns

### Component Testing

```typescript
describe("Component", () => {
  it("renders correctly", () => {
    render(<Component />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles user interaction", () => {
    const onAction = jest.fn();
    render(<Component onAction={onAction} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onAction).toHaveBeenCalled();
  });
});
```

### API Testing

```typescript
describe("API", () => {
  it("handles successful requests", async () => {
    const response = await apiClient.get("/endpoint");
    expect(response.status).toBe(200);
  });

  it("handles errors", async () => {
    await expect(apiClient.get("/invalid")).rejects.toThrow();
  });
});
```
