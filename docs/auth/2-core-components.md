# Core Authentication Components

## Token Management (jwt.ts)

The system uses JSON Web Tokens (JWT) for authentication with two types of tokens:

1. **Access Token**

   - Short-lived (1 hour)
   - Used for API authentication
   - Contains user ID, username, and role

2. **Refresh Token**
   - Long-lived (7 days)
   - Used to obtain new access tokens
   - Stored in database for additional security

```typescript
// Token Generation
export async function signAccessToken(payload: JWTPayload); // 1 hour expiry
export async function signRefreshToken(payload: JWTPayload); // 7 days expiry
export async function verifyToken(token: string): Promise<JWTPayload>;
```

## Cookie Management (cookies.ts)

Handles secure cookie operations for both client and server contexts:

```typescript
class AuthCookieManager {
  static getTokens(); // Get tokens from cookies
  static setTokens(access, refresh); // Set auth cookies with proper flags
  static clearTokens(); // Clear all auth cookies
  static getTokenHeader(); // Get Authorization header value
  static isRemembered(); // Check remember-me status
}
```

Cookie Configuration:

- Access Token: 24 hours
- Refresh Token: 30 days
- Remember Me: 180 days
- Secure flags: HttpOnly, Secure (in production), SameSite=Lax

## Core Authentication (index.ts)

Main authentication logic implementation:

```typescript
export async function loginUser({ email, username, password, options });
export async function registerUser(data: RegisterData);
export async function refreshUserToken(refreshToken?: string);
export async function logoutUser();
```

Features:

- User login with email or username
- Secure password handling
- Token refresh mechanism
- Session management
- Remember me functionality

## Validation (validation.ts)

Input validation and authentication checks:

```typescript
export function validateLoginCredentials(credentials: LoginCredentials);
export function validateRegisterData(data: RegisterData);
export function verifyUserStatus(user: any);
export async function requireAuth();
export async function requireRole(roles: UserRole[]);
```

Validation rules:

- Username: Min 3 characters
- Email: Valid format
- Password: Min 6 characters
- Role verification
- Account status checks

## Middleware Protection

The middleware provides route protection, particularly for admin routes:

```typescript
export async function middleware(request: NextRequest) {
  // Protects admin routes
  // Handles token verification
  // Manages auth redirects
}
```

Key features:

- Admin route protection
- Token verification
- Automatic redirection to login
- Refresh token handling

## Usage Examples

### Basic Authentication Flow

```typescript
// Login
await loginUser({
  email: "user@example.com",
  password: "password123",
  options: { sessionDuration: 30 * 24 * 60 * 60 }, // 30 days
});

// Protected Route Check
await requireAuth();

// Admin Route Check
await requireRole(["admin"]);

// Logout
await logoutUser();
```

### Token Refresh Flow

```typescript
// Automatic refresh when access token expires
const newTokens = await refreshUserToken();

// Manual refresh with specific token
const newTokens = await refreshUserToken(existingRefreshToken);
```

## Important Security Notes

1. **Token Security**

   - Access tokens are short-lived
   - Refresh tokens are securely stored
   - Both tokens use HttpOnly cookies

2. **Password Security**

   - Passwords are hashed using bcrypt
   - Salt rounds: 12
   - Never stored in plain text

3. **Route Protection**

   - Admin routes are protected by middleware
   - Role-based access control
   - Token verification on sensitive routes

4. **Error Handling**
   - Detailed error types
   - Secure error messages
   - Proper error logging

Remember to always use HTTPS in production and keep the JWT_SECRET secure and unique for each environment.
