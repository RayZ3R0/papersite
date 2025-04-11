# Authentication API Routes

The authentication system provides several API endpoints to handle authentication operations. All routes are located under `src/app/api/auth/`.

## Route Overview

```
/api/auth/
├── login/          # User login
├── register/       # User registration
├── logout/         # User logout
├── me/            # Get current user
├── refresh/        # Refresh access token
├── verify/        # Email verification
└── password/      # Password management
    └── reset/     # Password reset
```

## API Endpoints

### Login (`/api/auth/login`)

```typescript
// POST /api/auth/login
{
  "email": string,      // Optional if username provided
  "username": string,   // Optional if email provided
  "password": string,
  "rememberMe": boolean // Optional, defaults to true
}

// Response
{
  "user": {
    "_id": string,
    "username": string,
    "email": string,
    "role": "user" | "moderator" | "admin",
    "verified": boolean,
    "createdAt": string
  }
}
```

### Register (`/api/auth/register`)

```typescript
// POST /api/auth/register
{
  "username": string,
  "email": string,
  "password": string
}

// Response
{
  "user": {
    "_id": string,
    "username": string,
    "email": string,
    "role": "user",
    "verified": boolean,
    "createdAt": string
  }
}
```

### Logout (`/api/auth/logout`)

```typescript
// POST /api/auth/logout
// No request body needed

// Response
{
  "success": true
}
```

### Get Current User (`/api/auth/me`)

```typescript
// GET /api/auth/me
// Requires authentication

// Response
{
  "user": {
    "_id": string,
    "username": string,
    "email": string,
    "role": string,
    "verified": boolean,
    "createdAt": string
  }
}
```

### Refresh Token (`/api/auth/refresh`)

```typescript
// POST /api/auth/refresh
// Uses refresh token from cookies

// Response
{
  "user": {
    "_id": string,
    "username": string,
    "email": string,
    "role": string,
    "verified": boolean,
    "createdAt": string
  }
}
```

### Email Verification (`/api/auth/verify`)

```typescript
// GET /api/auth/verify?token=[verification_token]

// Response
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Password Reset (`/api/auth/password/reset`)

```typescript
// POST /api/auth/password/reset
{
  "email": string
}

// Response
{
  "success": true,
  "message": "Password reset email sent"
}

// POST /api/auth/password/reset?token=[reset_token]
{
  "password": string
}

// Response
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Error Handling

All routes use consistent error responses:

```typescript
{
  "error": string,    // Error message
  "code": string     // Error code (e.g., "INVALID_CREDENTIALS")
}
```

Error codes:

- `INVALID_CREDENTIALS`: Invalid login credentials
- `USER_NOT_FOUND`: User not found
- `USER_NOT_VERIFIED`: Email not verified
- `ACCOUNT_DISABLED`: Account is disabled
- `INVALID_TOKEN`: Invalid or expired token
- `SERVER_ERROR`: Internal server error

## Security Measures

1. **Rate Limiting**

   - Implemented on all auth routes
   - Prevents brute force attempts

2. **CSRF Protection**

   - Token validation
   - Secure cookie settings

3. **Input Validation**

   - Strict validation on all inputs
   - Sanitization of data

4. **Error Handling**
   - Generic error messages
   - Detailed server-side logging

## Important Notes

- All routes use POST method for sensitive operations
- Authentication headers should use Bearer token format
- Cookies are automatically handled by the API
- All responses use proper HTTP status codes
- Rate limiting and CSRF protection are enabled by default

Remember to update this documentation when modifying any API routes or their behavior.
