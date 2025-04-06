# Authentication and User Management Structure

## Core Authentication Components

### Models

- `src/models/User.ts`
  - User schema and model
  - Password hashing with bcrypt
  - Methods for password comparison
  - Token management (refresh, verification, reset)
  - Profile and subject preferences

### Authentication Library

- `src/lib/auth/`
  - `index.ts`: Core auth functions (login, register, refresh, logout)
  - `jwt.ts`: JWT token generation and verification
  - `cookies.ts`: Cookie management for auth tokens
  - `validation.ts`: Auth input validation and role checks
  - `tokens.ts`: Email verification and password reset tokens

### Types

- `src/lib/authTypes.ts`
  - Auth error handling
  - Login/Register data types
  - Token payload types
  - Response types

## API Routes

### Authentication

```
src/app/api/auth/
├── login/
│   └── route.ts         # Login endpoint
├── logout/
│   └── route.ts         # Logout endpoint
├── refresh/
│   └── route.ts         # Token refresh
├── register/
│   └── route.ts         # User registration
├── verify/
│   └── route.ts         # Email verification
├── password/
│   ├── reset/
│   │   └── route.ts     # Password reset
│   └── change/
│       └── route.ts     # Password change
└── me/
    └── route.ts         # Get current user
```

### User Profile

```
src/app/api/user/
├── profile/
│   └── route.ts         # Get/Update profile
└── subjects/
    └── route.ts         # Manage subject preferences
```

### Admin

```
src/app/api/admin/
├── users/
│   └── route.ts         # User management
└── settings/
    └── route.ts         # Admin settings
```

## Frontend Components

### Auth UI

```
src/components/auth/
├── LoginForm.tsx
├── RegisterForm.tsx
├── VerifyEmail.tsx
├── ResetPassword.tsx
├── UserNav.tsx          # User navigation menu
├── AuthButtons.tsx      # Login/Register buttons
└── ForbiddenMessage.tsx # Access denied message
```

### Profile UI

```
src/components/profile/
├── ProfileForm.tsx
├── SubjectSelector.tsx
├── UnitConfig.tsx
└── StudyPreferences.tsx
```

### Admin UI

```
src/components/admin/
├── UserList.tsx
├── UserEditor.tsx
└── AdminDashboard.tsx
```

## Pages

### Auth Pages

```
src/app/auth/
├── layout.tsx
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
├── verify/
│   └── page.tsx
└── reset-password/
    └── page.tsx
```

### User Pages

```
src/app/profile/
├── layout.tsx
├── page.tsx
└── settings/
    └── page.tsx
```

### Admin Pages

```
src/app/admin/
├── layout.tsx
├── page.tsx
└── users/
    └── page.tsx
```

## Forum Integration

### Forum API Routes

```
src/app/api/forum/
├── posts/
│   ├── route.ts
│   └── [postId]/
│       ├── route.ts
│       └── replies/
│           └── route.ts
├── replies/
│   ├── [replyId]/
│   │   └── route.ts
│   └── like/
│       └── route.ts
└── admin/
    └── route.ts
```

### Forum Models

- `src/models/Post.ts`: Forum post model
- `src/models/Reply.ts`: Reply model

### Forum Components

```
src/components/forum/
├── PostList.tsx
├── PostEditor.tsx
├── ReplyList.tsx
└── ReplyEditor.tsx
```

## Middleware and Utilities

### Auth Middleware

- `src/app/auth/middleware.ts`
  - Route protection
  - Role-based access control
  - User data injection

### API Utilities

- `src/lib/api-middleware.ts`
  - Database connection
  - Error handling
  - Response formatting

### Testing

```
src/__tests__/
├── auth/
│   ├── login.test.ts
│   ├── register.test.ts
│   └── profile.test.ts
└── forum/
    └── api.test.ts
```

## Hooks

```
src/hooks/
├── useAuth.ts
├── useProfile.ts
└── useProfileUpdate.ts
```

## Type Definitions

```
src/types/
├── profile.ts
└── registration.ts
```

## Features

### Authentication

- JWT-based authentication
- Access and refresh tokens
- Remember me functionality
- Email verification
- Password reset
- Session management

### User Profile

- Subject preferences
- Study settings
- Unit configurations
- Progress tracking

### Forum Features

- Post creation/editing
- Reply management
- Post pinning/locking
- Like system
- Moderation tools

### Admin Features

- User management
- Content moderation
- Site settings
- Usage statistics

### Security Features

- Password hashing
- Token rotation
- Rate limiting
- CSRF protection
- Input validation
