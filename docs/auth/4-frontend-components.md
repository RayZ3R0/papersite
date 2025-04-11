# Frontend Authentication Components

## Authentication Context

The `AuthContext` (`AuthContext.tsx`) provides authentication state and methods throughout the application.

```typescript
interface AuthContextType {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: string | null;
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### Usage

```tsx
function MyComponent() {
  const { user, login, logout, error } = useAuth();
  // Use auth context values and methods
}
```

### Features

- Automatic user session persistence
- Loading states for auth operations
- Error handling and display
- Type-safe authentication state

## Login Form Component

The `LoginForm` (`LoginForm.tsx`) handles user authentication:

```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  returnTo?: string;
}
```

### Features

- Email/Username login support
- Remember me functionality
- Password visibility toggle
- Form validation
- Loading states
- Error display
- Redirect handling

### Example Usage

```tsx
<LoginForm
  onSuccess={() => console.log("Login successful")}
  returnTo="/dashboard"
/>
```

## Registration Form Component

The `RegisterForm` (`RegisterForm.tsx`) handles new user registration:

### Registration Steps

1. Basic Information

   - Username
   - Email
   - Password

2. Study Preferences

   - Daily study hours
   - Preferred study time
   - Notification preferences

3. Subject Selection
   - Subject codes
   - Level (AS/A2)
   - Target grades

### Features

- Multi-step registration
- Form validation
- Error handling
- Success redirects
- Loading states

## Protected Content Component

The `ProtectedContent` component ensures content is only shown to authenticated users:

```tsx
interface ProtectedContentProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
}
```

### Usage

```tsx
<ProtectedContent roles={["admin"]}>
  <AdminDashboard />
</ProtectedContent>
```

## Form Components

### FormInput

Reusable input component with built-in features:

```typescript
interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  placeholder?: string;
}
```

### FormError

Error display component:

```typescript
interface FormErrorProps {
  error: string;
  className?: string;
}
```

### LoadingButton

Button component with loading state:

```typescript
interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit";
  className?: string;
}
```

## Authentication Layout

The `AuthLayout` component provides consistent styling for auth pages:

```tsx
<AuthLayout>
  <LoginForm />
</AuthLayout>
```

Features:

- Responsive design
- Consistent branding
- Error boundary
- Loading states

## Important Notes

### State Management

- Authentication state is managed through Context
- Cookies handle token persistence
- Loading states prevent multiple submissions

### Error Handling

- Form validation errors
- API error displays
- Network error handling
- Session expiration handling

### Security

- Password visibility toggle
- Form submission protection
- Session management
- CSRF protection

### Accessibility

- ARIA labels
- Keyboard navigation
- Focus management
- Loading indicators

Remember to:

1. Update components when auth requirements change
2. Maintain consistent error handling
3. Test all auth flows thoroughly
4. Keep accessibility in mind
5. Update documentation when modifying components
