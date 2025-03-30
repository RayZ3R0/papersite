# Authentication System Implementation Guide

## Dependencies to Add

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jose": "^5.1.3",
    "cookie": "^0.6.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie": "^0.6.0"
  }
}
```

## Phase 1: Core Authentication System (1-2 days)

### 1. Base Files Structure

```
src/
├── models/
│   └── User.ts       # MongoDB User model
├── lib/
│   ├── authTypes.ts  # Type definitions
│   ├── jwt.ts        # JWT utilities
│   └── authUtils.ts  # Auth helper functions
├── hooks/
│   └── useAuth.tsx   # Auth context and hook
├── components/
│   └── auth/
│       ├── LoginModal.tsx      # Bottom sheet modal
│       ├── LoginForm.tsx       # Login form
│       ├── RegisterForm.tsx    # Register form
│       └── ProtectedContent.tsx
└── app/
    └── api/
        └── auth/
            ├── register/
            ├── login/
            ├── logout/
            └── refresh/
```

### 2. MongoDB Schema (User.ts)

```typescript
interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: "user" | "moderator" | "admin";
  banned: boolean;
  createdAt: Date;
  lastLogin: Date;
  refreshToken?: {
    token: string;
    expiresAt: Date;
  };
  email?: string;
  verified: boolean;
}
```

**Indexes:**

- username (unique)
- email (sparse, unique)
- refreshToken.token

### 3. Authentication Flow

**Login:**

1. User submits credentials
2. Validate & verify password
3. Generate access + refresh tokens
4. Store refresh token in DB
5. Set HTTP-only cookies
6. Return user data

**Register:**

1. Validate input
2. Check username availability
3. Hash password
4. Create user
5. Follow login flow

**Logout:**

1. Clear cookies
2. Invalidate refresh token
3. Update lastLogin

**Token Refresh:**

1. Verify refresh token
2. Check token in DB
3. Generate new access token
4. Update refresh token
5. Set new cookies

## Phase 2: Feature Integration (2-3 days)

### 1. Protected Features

- Forum posting/replying
- Note saving
- Study progress tracking
- Personal collections

### 2. Integration Points

```typescript
// Forum Posts
export async function createPost(req: Request) {
  const user = await requireAuth(req);
  // Create post
}

// Annotations
export function saveAnnotations() {
  if (!user) {
    openLoginModal({
      message: "Login to save your annotations",
      returnTo: currentPage,
    });
    return;
  }
  // Save annotations
}

// Progress Tracking
export function trackProgress() {
  if (!user) {
    showLoginPrompt("Track your study progress");
    return;
  }
  // Update progress
}
```

### 3. UI Components

**LoginModal**

- Bottom sheet (mobile)
- Tabs for login/register
- Form validation
- Error handling
- Success redirects

**ProtectedContent**

- Loading states
- Custom fallbacks
- Role-based access

## Phase 3: Email System (2 days)

### 1. Email Setup (using Resend)

```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

**Templates:**

- Welcome email
- Verification email
- Password reset
- Login notification

### 2. Verification Flow

1. Register → Generate token
2. Send verification email
3. User clicks link
4. Verify token
5. Update user status
6. Redirect to login

### 3. Password Reset

1. Request reset → Generate token
2. Send reset email
3. User clicks link
4. Verify token
5. Allow password change
6. Clear all sessions

## Environment Variables

```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_URL=http://localhost:3000
```

## Mobile UI Considerations

### Login Modal

- Full-width bottom sheet
- Max height 80vh
- Smooth slide animation
- Touch-friendly inputs
- Clear error states
- Loading indicators

### Auth Prompts

- Toast notifications
- Action preservation
- Clear benefits messaging
- Easy dismissal

## Phase 4: Security Enhancements (1-2 days)

### 1. Rate Limiting

Implement rate limiting to prevent brute force attacks:

```typescript
// API route middleware
export function rateLimit(options: RateLimitOptions) {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options;

  return async function (req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const key = `${options.keyPrefix}:${ip}`;

    // Check Redis for existing count
    const currentCount = (await redis.get(key)) || 0;

    if (currentCount >= max) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      );
    }

    // Increment count and set expiry
    await redis.incr(key);
    await redis.expire(key, windowMs / 1000);
  };
}

// Usage
export const POST = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  keyPrefix: "login",
});
```

### 2. Two-Factor Authentication

Optional 2FA implementation:

```typescript
interface User {
  // existing fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

// Login flow with 2FA
async function login(credentials) {
  const user = await validateCredentials(credentials);

  if (user.twoFactorEnabled) {
    // Generate temporary token with short expiry
    const tempToken = await generateTempToken(user.id);
    return { requiresTwoFactor: true, tempToken };
  }

  // Normal login flow
  return generateTokens(user);
}

// Verify 2FA code
async function verifyTwoFactorCode(req) {
  const { tempToken, code } = req.body;
  const userId = await verifyTempToken(tempToken);
  const user = await getUserById(userId);

  const isValidCode = verifyTOTP(code, user.twoFactorSecret);

  if (!isValidCode) {
    throw new Error("Invalid code");
  }

  // Continue with normal login flow
  return generateTokens(user);
}
```

### 3. Security Headers

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Set security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );

  return response;
}
```

## Phase 5: User Profile & Management (2 days)

### 1. User Profile Page

Routes and components:

```
src/
└── app/
    └── profile/
        ├── page.tsx           # Main profile page
        ├── settings/
        │   └── page.tsx       # User settings
        └── security/
            └── page.tsx       # Security settings
```

### 2. User Management for Admins

Admin dashboard components:

```
src/
└── app/
    └── admin/
        ├── users/
        │   └── page.tsx       # User list
        └── reports/
            └── page.tsx       # Reported content
```

### 3. Analytics & Monitoring

Track key metrics:

- Login success/failure rates
- Registration conversion
- User retention
- Feature usage by authenticated users

## Best Practices & Optimizations

### 1. Security Checklist

- ✅ Store passwords with bcrypt (cost factor 12+)
- ✅ Use HTTP-only, Secure, SameSite cookies
- ✅ Implement rate limiting
- ✅ Short session expiry (1 hour access tokens)
- ✅ Invalidate tokens on password change
- ✅ CSRF protection
- ✅ Input validation/sanitization
- ✅ Content Security Policy

### 2. Performance Considerations

- Minimize token payload size
- Cache frequent auth checks
- Lazy load auth components
- Use WebAuthn for passwordless when possible

### 3. Testing Strategy

```
tests/
├── unit/
│   └── auth/
│       ├── jwt.test.ts
│       └── validation.test.ts
├── integration/
│   └── auth/
│       ├── login.test.ts
│       └── register.test.ts
└── e2e/
    └── auth.spec.ts
```

## Implementation Code Samples

### JWT Utilities (jwt.ts)

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function signAccessToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET);

  return token;
}

export async function signRefreshToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export function setTokenCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export function clearTokenCookies() {
  const cookieStore = cookies();

  cookieStore.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  cookieStore.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}
```

### Auth Context (useAuth.tsx)

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserWithoutPassword } from "@/lib/authTypes";

interface AuthContextType {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  openLoginModal: (options?: { message?: string; returnTo?: string }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user from API
    fetchCurrentUser()
      .then((userData) => {
        if (userData) {
          setUser(userData);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(username: string, password: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const userData = await response.json();
      setUser(userData.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(userData: RegisterData) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function openLoginModal(options = {}) {
    // Implementation will depend on your UI library
    // For example, using a global state manager or context
    window.dispatchEvent(
      new CustomEvent("open-login-modal", { detail: options })
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        openLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

async function fetchCurrentUser(): Promise<UserWithoutPassword | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch (err) {
    return null;
  }
}
```

## Deployment Checklist

Before deploying your authentication system to production:

- [ ] Set strong, unique JWT secrets
- [ ] Configure proper CORS settings
- [ ] Set up monitoring for suspicious login attempts
- [ ] Test password reset and account recovery flows
- [ ] Implement database backup for user accounts
- [ ] Perform security audit and penetration testing
- [ ] Document user authentication processes
- [ ] Create a response plan for security incidents

## Future Enhancements

Consider these features for future iterations:

- Social login (Google, GitHub, etc.)
- Account merging
- Progressive profiling
- Login notifications for suspicious activity
- Fraud detection and prevention
- User activity logs
- Consent and privacy management
- Multi-tenant isolation

---

This implementation guide provides a comprehensive approach to building a secure, user-friendly authentication system that integrates with your application's features while maintaining best practices for security and performance.
