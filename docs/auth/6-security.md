# Authentication Security Measures

## Token Security

### JWT Implementation

```typescript
// Short-lived access tokens
const ACCESS_TOKEN_EXPIRY = "1h";

// Longer-lived refresh tokens
const REFRESH_TOKEN_EXPIRY = "7d";

// Token signing with secure algorithm
const jwt = await new SignJWT(payload)
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime(expiry)
  .setIssuedAt()
  .sign(SECRET);
```

### Token Storage

1. **Access Token**

   - Stored in HttpOnly cookie
   - Short expiration (1 hour)
   - Secure flag in production
   - SameSite=Lax protection

2. **Refresh Token**
   - Stored in HttpOnly cookie
   - Database storage with expiry
   - Longer expiration (7 days)
   - One token per user
   - Invalidated on logout

## Cookie Security

```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  priority: "high",
};
```

### Cookie Durations

```typescript
const DURATIONS = {
  accessToken: 24 * 60 * 60, // 24 hours
  refreshToken: 30 * 24 * 60 * 60, // 30 days
  rememberMe: 180 * 24 * 60 * 60, // 180 days
};
```

## Password Security

1. **Hashing**
   - Using bcrypt
   - 12 salt rounds
   - Async operations

```typescript
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});
```

2. **Validation**
   - Minimum length requirements
   - Complexity checks
   - Secure comparison

## Route Protection

### Middleware Security

```typescript
export async function middleware(request: NextRequest) {
  // Admin route protection
  if (pathname.startsWith("/admin")) {
    // Token verification
    // Role checking
    // Secure redirects
  }
}
```

### Role-Based Access

```typescript
export async function requireRole(roles: UserRole[]) {
  const payload = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new AuthError("INVALID_TOKEN", "Insufficient permissions");
  }
}
```

## API Security

1. **Input Validation**

   - Request body validation
   - Query parameter sanitization
   - Type checking
   - Error handling

2. **Response Security**

   - No sensitive data in responses
   - Consistent error formats
   - Proper status codes
   - Limited error details

3. **Rate Limiting**
   - Login attempts
   - Password reset requests
   - API calls

## Session Management

1. **Session Handling**

   - Token-based sessions
   - Automatic refresh
   - Secure logout
   - Session duration control

2. **Remember Me**
   - Secure implementation
   - Extended session duration
   - Database tracking

## Security Headers

```typescript
// Example security headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self';",
};
```

## Error Handling

### Secure Error Messages

```typescript
// Public error
throw new AuthError("INVALID_CREDENTIALS", "Invalid credentials");

// Internal error (logged but not exposed)
console.error("Database error:", error);
throw new AuthError("SERVER_ERROR", "An error occurred");
```

## CSRF Protection

1. **Prevention Measures**

   - SameSite cookie attribute
   - CSRF tokens where needed
   - Origin validation
   - Secure headers

2. **Implementation**
   - Token validation
   - Request verification
   - Secure cookie handling

## Security Best Practices

1. **Environment Variables**

   - Secure secrets storage
   - Different values per environment
   - Regular rotation

2. **Logging**

   - Secure error logging
   - Activity monitoring
   - No sensitive data logged

3. **Database Security**

   - Encrypted connections
   - Access control
   - Input sanitization

4. **Regular Updates**
   - Dependency updates
   - Security patches
   - Version monitoring

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Enable security headers
- [ ] Validate all inputs
- [ ] Sanitize all outputs
- [ ] Use secure session handling
- [ ] Implement proper error handling
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities
- [ ] Keep dependencies updated

Remember to:

1. Regularly review security measures
2. Update security configurations
3. Monitor for security issues
4. Keep documentation updated
5. Train team on security practices
