# Edge Function Size Optimization Plan

## Problem

The Edge Function for auth/login and admin pages is exceeding Vercel's 1MB size limit due to heavy dependencies like the 'jose' library and complex auth logic in the middleware.

## Solution Overview

### 1. Create New Token Verification API Route

Create a new API route at `src/app/api/auth/verify-token/route.ts` that will:

- Handle token verification using the 'jose' library
- Return user role and verification status
- Run on Node.js runtime (not Edge)

```typescript
// Example structure
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  const token = await request.text();
  const payload = await verifyToken(token);
  return Response.json({ payload });
}
```

### 2. Optimize Middleware

Modify `src/middleware.ts` to:

- Remove heavy imports (jose, jwt verification)
- Only check token presence
- Call verify-token API for actual verification
- Keep lightweight cookie operations

```typescript
// Example structure
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access-token");

  if (!token) {
    return redirectToLogin(request);
  }

  // Call verify-token API instead of verifying locally
  const verifyResponse = await fetch("/api/auth/verify-token", {
    method: "POST",
    body: token,
  });

  if (!verifyResponse.ok) {
    return redirectToLogin(request);
  }
}
```

### 3. Update Admin Page

- Move ProtectedContent logic to API routes
- Implement code splitting for admin components
- Use dynamic imports for heavy components

```typescript
// Example structure
const AdminDashboard = dynamic(() => import("@/components/admin/Dashboard"), {
  loading: () => <LoadingSpinner />,
});
```

## Implementation Steps

1. Create verify-token API route
2. Modify middleware to use new API
3. Update admin page with code splitting
4. Test all auth flows
5. Verify bundle sizes

## Migration Strategy

- Deploy changes incrementally
- Monitor performance and errors
- Have rollback plan ready

## Expected Outcomes

- Edge Function size under 1MB limit
- Maintained security with distributed verification
- Improved performance from code splitting

## References

- [Vercel Edge Function Limits](https://vercel.link/edge-function-size)
- [Next.js Code Splitting](https://nextjs.org/docs/pages/building-your-application/optimizing)
