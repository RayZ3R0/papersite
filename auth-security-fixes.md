# Authentication Security Fixes

## 1. Token Management Improvements

### Current Issues:

- Token expiry too long (7 days for access token)
- Cookie settings need hardening
- Network traffic vulnerable

### Fixes:

````typescript
// In src/lib/auth/config.ts
export const SECURITY_CONFIG = {
  tokens: {
    accessTokenExpiry: "15m", // Reduce from 7d to 15m
    refreshTokenExpiry: "7d", // Reduce from 90d to 7d
    algorithm: "HS256",
    renewalOffset: 2 * 60, // Start renewal 2 minutes before expiry
  },
};

// In src/lib/auth/cookies.ts
const cookieOptions = {
  httpOnly: true,
  secure: true, // Always enable
## 2. Login/Registration Security

### Current Issues:
- No rate limiting
- No CSRF protection
- Basic password requirements

### Fixes:
```typescript
// In src/lib/auth/config.ts
export const SECURITY_CONFIG = {
  rateLimit: {
    login: {
      points: 5,    // 5 attempts
      duration: 15 * 60, // per 15 minutes
      blockDuration: 30 * 60 // Block for 30 minutes
    }
  },
  password: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
    maxAttempts: 5
  }
};

// In src/middleware.ts
export async function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
## 3. API Route Security

### Current Issues:
- Basic error responses
- Missing security headers
- MongoDB connections not optimized

### Fixes:
```typescript
// In src/lib/security/headers.ts
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// In src/app/api/user/profile/route.ts
export async function GET(req: NextRequest) {
  try {
    // Add correlation ID for request tracking
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Profile request started`);

    // Validate auth token
    const user = await requireAuth();

    // Add security headers
    const response = NextResponse.json(data);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    handleApiError(error, requestId);
  }
}
```
  response.headers.set('Content-Security-Policy', "default-src 'self'");
## 4. Email Verification (Toggleable)

### Implementation:
```typescript
// In .env
ENABLE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_SECRET=your-secret
EMAIL_VERIFICATION_EXPIRY=24h

// In src/lib/auth/email.ts
export const emailVerification = {
  enabled: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
  tokenSecret: process.env.EMAIL_VERIFICATION_SECRET,
  tokenExpiry: ms(process.env.EMAIL_VERIFICATION_EXPIRY || '24h'),

  generateToken: async (userId: string) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + ms('24h'));

    await User.findByIdAndUpdate(userId, {
      verificationToken: token,
      verificationTokenExpires: expires
    });

    return token;
  },

  sendEmail: async (user: UserDoc, token: string) => {
    const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/auth/verify?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `Click here to verify your email: ${verifyUrl}`
    });
  }
};

// Add to login/register flow
if (emailVerification.enabled) {
  const token = await emailVerification.generateToken(user._id);
  await emailVerification.sendEmail(user, token);
}
```

## 5. Implementation Steps

1. Update Security Config:
- Add rate limiting
- Enable strict cookie settings
- Add security headers

2. Enhance API Routes:
- Add request validation
- Add correlation IDs
- Clean error handling

3. Improve Login Flow:
- Add CSRF protection
- Implement rate limiting
- Add request logging

4. Database Security:
- Optimize connections
- Add query timeouts
- Validate input

## Required Testing

1. Security Features:
- Test rate limiting
- Verify CSRF protection
- Check security headers
- Test email verification

2. Error Handling:
- Test invalid tokens
- Test expired sessions
- Check error responses

3. Performance:
- Test connection pooling
- Monitor response times
- Check memory usage
  return response;
}
````

sameSite: "strict", // Change from 'lax'
path: "/",
domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
partitioned: true, // Enable partitioned cookies
};

```

```
