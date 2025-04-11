# Authentication System Improvements Plan

## Current Issues

1. **Login Persistence Issues**

   - Random logouts
   - Session loss on builds
   - Inconsistent login state

2. **Session Management Problems**

   - Account switching conflicts
   - State desynchronization
   - Cookie handling issues

3. **Build and Static Site Issues**

   - Cookie warnings during build
   - Static generation conflicts
   - Session persistence problems

4. **Email Verification**
   - Needs implementation while staying soft-disabled
   - Better verification flow

## Improvements Plan

### 1. Enhanced Session Persistence

#### Cookie Management Updates (`src/lib/auth/cookies.ts`)

```typescript
const DURATIONS = {
  accessToken: 7 * 24 * 60 * 60, // Increase to 7 days
  refreshToken: 90 * 24 * 60 * 60, // Increase to 90 days
  rememberMe: 365 * 24 * 60 * 60, // Increase to 1 year
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  priority: "high",
  maxAge: DURATIONS.accessToken,
};
```

#### Token Refresh Strategy (`src/lib/auth/index.ts`)

```typescript
export async function refreshUserToken(refreshToken?: string) {
  // Add preemptive refresh
  // Refresh when token is 80% through its lifetime
  const tokenData = await verifyToken(accessToken);
  const shouldRefresh =
    tokenData.exp &&
    Date.now() >=
      (tokenData.iat + (tokenData.exp - tokenData.iat) * 0.8) * 1000;

  if (shouldRefresh) {
    // Perform refresh
  }
}
```

### 2. Improved Session Management

#### Auth Context Updates (`src/components/auth/AuthContext.tsx`)

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Add session tracking
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Force refresh on mount and after builds
  useEffect(() => {
    const initSession = async () => {
      await refreshUserToken();
      setSessionId(generateSessionId());
    };
    initSession();
  }, []);

  // Add account switching handler
  const switchAccount = async (newCredentials) => {
    await logout(); // Clear existing session
    await login(newCredentials); // Start fresh session
  };
}
```

### 3. Build-Time Optimizations

#### Static Site Generation Handling

```typescript
// Add dynamic config for auth pages
export const dynamic = "force-dynamic";

// Update middleware for static paths
export function isStaticPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  );
}
```

### 4. Email Verification Implementation

#### Soft-Disabled Verification (`src/lib/auth/validation.ts`)

```typescript
export async function verifyUserStatus(user: any) {
  // Keep email verification soft-disabled
  // but implement the infrastructure
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
    if (!user.verified) {
      throw new AuthError("USER_NOT_VERIFIED", "Please verify your email");
    }
  }
}
```

## Implementation Steps

1. **Session Persistence**

   - [ ] Update cookie durations
   - [ ] Implement preemptive token refresh
   - [ ] Add session tracking
   - [ ] Improve error handling

2. **State Management**

   - [ ] Add session ID tracking
   - [ ] Implement proper account switching
   - [ ] Add state synchronization
   - [ ] Improve error recovery

3. **Build Optimization**

   - [ ] Update static path handling
   - [ ] Add dynamic routes where needed
   - [ ] Implement build-safe auth checking
   - [ ] Add development warnings

4. **Email Verification**
   - [ ] Implement verification infrastructure
   - [ ] Add soft-disable toggle
   - [ ] Create verification emails
   - [ ] Add verification UI

## Code Changes Required

### 1. Update Auth Context

- Add session tracking
- Improve state management
- Add account switching
- Enhance error handling

### 2. Update Cookie Management

- Increase token durations
- Improve cookie persistence
- Add backup mechanisms
- Better error recovery

### 3. Update Build Configuration

- Add dynamic routes
- Update static handling
- Improve error messages
- Add development checks

### 4. Add Email Verification

- Create verification system
- Add soft-disable option
- Implement email sending
- Add verification routes

## Security Considerations

1. **Token Security**

   - Maintain secure storage
   - Proper encryption
   - Safe transmission

2. **Session Security**

   - Proper invalidation
   - Secure switching
   - State protection

3. **Build Security**

   - Safe static generation
   - Protected routes
   - Secure cookies

4. **Verification Security**
   - Secure tokens
   - Safe email handling
   - Protected routes

## Testing Requirements

1. **Session Tests**

   - Persistence verification
   - State consistency
   - Error recovery

2. **Build Tests**

   - Static generation
   - Dynamic routes
   - Cookie handling

3. **Security Tests**

   - Token safety
   - Session security
   - Route protection

4. **Verification Tests**
   - Email sending
   - Token handling
   - UI flow

Remember to update the documentation as changes are implemented.
