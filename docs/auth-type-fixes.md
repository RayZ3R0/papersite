# Authentication Type System Fixes

## Current Issues

1. Type mismatch between `JWTPayload` and `UserWithoutPassword`:

   - `JWTPayload._id` is optional (`_id?: string`)
   - `UserWithoutPassword._id` is required (`_id: string`)
   - Different required/optional fields between types

2. Affected Files:
   - `src/components/auth/AuthContext.tsx`
   - `src/components/auth/ProtectedContent.tsx`
   - `src/lib/auth/jwt.ts`
   - `src/lib/authTypes.ts`

## Proposed Solutions

### 1. Update JWTPayload Type

Current issue in `jwt.ts`:

```typescript
export interface JWTPayload {
  _id?: string; // Optional for backward compatibility
  userId: string; // Main identifier
  // ... other fields
}
```

We need to ensure `_id` is always present in the JWT payload. Update `verifyToken` to always set `_id` equal to `userId` if not present.

### 2. Modify AuthContext

The `AuthContext` should convert `JWTPayload` to `UserWithoutPassword` before setting the user state:

```typescript
// Add conversion function
function jwtToUser(payload: JWTPayload): UserWithoutPassword {
  return {
    _id: payload._id || payload.userId, // Fallback to userId if _id not present
    email: payload.email,
    username: payload.username,
    role: payload.role,
    createdAt: payload.createdAt || new Date(),
    banned: payload.banned || false,
    verified: payload.verified || false,
    lastLogin: payload.lastLogin,
  };
}
```

### 3. Update Type Usage in Components

In `ProtectedContent.tsx`, update the component to use `UserWithoutPassword`:

```typescript
const { user, isLoading } = useAuth();
// ...
if (render && user) {
  const userWithoutPassword = jwtToUser(user);
  return <>{render(userWithoutPassword)}</>;
}
```

## Implementation Steps

1. Switch to Code mode
2. Update `jwt.ts` to ensure `_id` is always present in verified tokens
3. Modify `AuthContext.tsx` to properly convert types
4. Update `ProtectedContent.tsx` to handle the converted types
5. Add proper type guards and error handling

## Testing Plan

1. Test token verification with and without `_id` field
2. Test protected routes with different user roles
3. Verify backward compatibility with existing tokens
4. Test error handling for malformed tokens

## Migration Strategy

1. Deploy changes to ensure `_id` is set in new tokens
2. Add fallback to use `userId` for existing tokens
3. Monitor for any authentication errors
4. Plan gradual migration of existing tokens
