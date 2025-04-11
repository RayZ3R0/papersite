# Authentication Flow Diagrams

## Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Auth API
    participant DB as Database

    U->>FE: Enter credentials
    FE->>API: POST /api/auth/login
    API->>DB: Find user
    DB-->>API: User data
    API->>API: Verify password
    API->>API: Generate tokens
    API-->>FE: Set cookies & return user
    FE->>FE: Update AuthContext
    FE-->>U: Redirect to app
```

## Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Auth API
    participant DB as Database
    participant Mail as Email Service

    U->>FE: Complete registration form
    FE->>API: POST /api/auth/register
    API->>DB: Check existing user
    DB-->>API: User exists?
    API->>DB: Create new user
    API->>Mail: Send verification email
    API->>API: Generate tokens
    API-->>FE: Set cookies & return user
    FE->>FE: Update AuthContext
    FE-->>U: Show success message
```

## Token Refresh Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Auth API
    participant DB as Database

    FE->>API: Request with expired token
    API->>API: Validate access token
    API->>API: Token expired
    API->>API: Check refresh token
    API->>DB: Validate refresh token
    DB-->>API: Token valid
    API->>API: Generate new tokens
    API->>DB: Update refresh token
    API-->>FE: Set new cookies
    FE->>FE: Continue with request
```

## Protected Route Access

```mermaid
sequenceDiagram
    participant U as User
    participant MW as Middleware
    participant API as Auth API
    participant DB as Database

    U->>MW: Access protected route
    MW->>MW: Check access token
    alt Token Valid
        MW->>U: Allow access
    else Token Invalid
        MW->>MW: Check refresh token
        alt Has Refresh Token
            MW->>API: Attempt refresh
            API->>DB: Validate refresh token
            DB-->>API: Token valid
            API-->>MW: New tokens
            MW->>U: Allow access
        else No Valid Tokens
            MW->>U: Redirect to login
        end
    end
```

## Logout Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Auth API
    participant DB as Database

    U->>FE: Click logout
    FE->>API: POST /api/auth/logout
    API->>DB: Invalidate refresh token
    API->>API: Clear auth cookies
    API-->>FE: Logout success
    FE->>FE: Clear AuthContext
    FE-->>U: Redirect to login
```

## Password Reset Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Auth API
    participant DB as Database
    participant Mail as Email Service

    U->>FE: Request password reset
    FE->>API: POST /api/auth/password/reset
    API->>DB: Find user
    API->>API: Generate reset token
    API->>DB: Save reset token
    API->>Mail: Send reset email
    Mail-->>U: Reset link
    U->>FE: Click reset link
    FE->>API: Verify reset token
    API->>DB: Update password
    API-->>FE: Reset success
    FE-->>U: Show success message
```

## Role-Based Access Control

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant MW as Middleware
    participant API as Auth API

    U->>FE: Access admin route
    FE->>MW: Route check
    MW->>API: Verify role
    alt Admin Role
        API-->>MW: Allow access
        MW-->>FE: Continue
        FE-->>U: Show admin content
    else Non-Admin Role
        API-->>MW: Deny access
        MW-->>FE: Redirect
        FE-->>U: Show error message
    end
```

## Important Notes

1. **Error Handling**

   - All flows should include error handling
   - Proper user feedback
   - Secure error logging

2. **State Management**

   - AuthContext updates
   - Cookie management
   - Session tracking

3. **Security Considerations**

   - Token validation
   - Role verification
   - Session management

4. **User Experience**
   - Loading states
   - Error messages
   - Success feedback

Remember to update these diagrams when modifying authentication flows or adding new features.
