# API Security Implementation Guide

## Domain & CORS Configuration

### Multiple Domain Support

The application supports multiple domains with secure cookie and CORS handling:

```env
# Example .env configuration
NEXT_PUBLIC_ALLOWED_DOMAINS=papernexus.vercel.app,edexcel.vercel.app,papernexys.xyz
NEXT_PUBLIC_VERCEL_DOMAIN=.vercel.app
NEXT_PUBLIC_CUSTOM_DOMAIN=papernexys.xyz
```

### Cookie Behavior

- `.vercel.app` domains share cookies for seamless authentication
- Custom domain (`papernexys.xyz`) has separate cookies
- Development environment uses localhost cookies

## Security Features

### Headers

- Strict Transport Security (HSTS)
- Content Security Policy (CSP)
- XSS Protection
- Frame Options
- Referrer Policy
- Permissions Policy
- Cache Control

### Rate Limiting

```typescript
const rateLimits = {
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 30 * 60 * 1000, // 30 minutes
  },
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDuration: 24 * 60 * 60 * 1000, // 24 hours
  },
};
```

### Request Validation

- Email format validation
- Password strength requirements
- Input sanitization
- JSON schema validation

### CORS Policy

- Strict origin checking
- Configurable allowed origins
- Proper preflight handling
- Credential support

## API Routes Security

### Authentication

- JWT with refresh tokens
- Secure cookie storage
- Session management
- Remember me functionality

### Request Flow

1. Origin validation
2. Rate limit check
3. Input validation
4. Authentication verification
5. Business logic
6. Secure response

## Implementation Examples

### Protected API Route

```typescript
export async function GET(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "profile");
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    // Auth check
    const user = await requireAuth();

    // Add security headers
    const response = createSecureResponse(data, 200, "api");

    return response;
  } catch (error) {
    handleApiError(error);
  }
}
```

### Client Request

```typescript
const response = await fetch("/api/user/profile", {
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  credentials: "include",
});
```

## Environment Configuration

### Development

```env
NODE_ENV=development
DEBUG_LOGS=true
CORS_ALLOWED_ORIGINS=http://localhost:3000
DISABLE_RATE_LIMIT_IN_DEV=false
```

### Production

```env
NODE_ENV=production
NEXT_PUBLIC_ALLOWED_DOMAINS=papernexus.vercel.app,edexcel.vercel.app,papernexys.xyz
NEXT_PUBLIC_VERCEL_DOMAIN=.vercel.app
NEXT_PUBLIC_CUSTOM_DOMAIN=papernexys.xyz
```

## Security Best Practices

1. **Cookie Security**

   - HttpOnly flags
   - Secure in production
   - SameSite policy
   - Domain-specific settings

2. **Authentication**

   - Rate limited login attempts
   - Secure session management
   - Token refresh strategy
   - Remember me with secure defaults

3. **Request Protection**

   - Input validation
   - CSRF protection
   - XSS prevention
   - Rate limiting

4. **Response Security**

   - Security headers
   - Safe error responses
   - Content type controls
   - Cache directives

5. **Development Guidelines**
   - Use TypeScript
   - Implement request logging
   - Error tracking
   - Security testing

## Deployment Checklist

1. Configure environment variables
2. Set up domain configuration
3. Enable HTTPS
4. Configure security headers
5. Test CORS behavior
6. Verify rate limiting
7. Check cookie behavior
8. Monitor error logs

## Testing

### Security Tests

```bash
# Rate limiting
npm run test:security:rate-limit

# CORS
npm run test:security:cors

# Authentication
npm run test:security:auth

# Headers
npm run test:security:headers
```

### Load Testing

```bash
# API endpoints
npm run test:load:api

# Authentication
npm run test:load:auth
```
