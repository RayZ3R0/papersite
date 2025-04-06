# Profile Page Implementation Prerequisites

## Files to Check First

1. User Model and Types

```
src/models/User.ts               - User schema and types
src/types/registration.ts        - Registration data types (subjects, preferences)
src/lib/authTypes.ts            - Auth-related types
```

2. Authentication System

```
src/lib/auth.ts                 - Core auth functionality
src/components/auth/AuthContext - Auth context provider
src/app/api/auth/*              - Auth-related API routes
```

3. Theme System

```
tailwind.config.js              - Theme colors and classes
src/app/globals.css             - Global styles
```

## Data Structures to Understand

### 1. User Data Structure

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  verified: boolean;
  subjects?: UserSubject[];
  studyPreferences?: StudyPreferences;
  createdAt: Date;
  lastLogin: Date;
  loginCount: number;
}
```

### 2. Subject Data Structure

```typescript
interface UserSubject {
  subject: {
    code: string; // e.g., "MATH_P1"
    name: string; // e.g., "Pure Mathematics 1"
    type: string; // e.g., "main", "optional"
    category: string; // e.g., "mathematics"
  };
  targetGrade: string;
  examSession: string;
}
```

### 3. Study Preferences

```typescript
interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: string;
  notifications: boolean;
}
```

## Required API Endpoints to Create

1. Profile Data Endpoint

```
GET /api/user/profile
- Returns user profile data
- Requires authentication
```

2. Update Profile Endpoint

```
PATCH /api/user/profile
- Updates user profile data
- Handles subjects and preferences
```

3. Profile Settings Endpoint

```
PATCH /api/user/settings
- Updates user settings
- Handles notifications, study preferences
```

## Required Components to Create

1. Profile Layout

```
src/app/profile/layout.tsx
- Handles auth protection
- Common layout elements
```

2. Main Profile Components

```
src/components/profile/
├── ProfileHeader.tsx      - User info and stats
├── LoadingProfile.tsx    - Loading states
├── SubjectDashboard.tsx  - Subject management
├── StudyPreferences.tsx  - Preferences panel
└── ProfileStats.tsx      - Progress stats
```

## Required Hooks to Create

1. Profile Data Hook

```typescript
// src/hooks/useProfile.ts
function useProfile() {
  return {
    profile: UserProfile;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  }
}
```

2. Profile Update Hook

```typescript
// src/hooks/useProfileUpdate.ts
function useProfileUpdate() {
  return {
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    isUpdating: boolean;
    error: string | null;
  }
}
```

## Theme Integration

1. Color Scheme

```
bg-surface        - Background colors
text-text         - Text colors
border-border     - Border colors
bg-primary        - Primary action colors
```

2. Common Styles

```
rounded-lg        - Border radius
shadow-sm        - Shadows
transition-*     - Animations
```

## Implementation Order

1. Basic Structure

   - Profile layout with auth protection
   - Basic profile page with loading state
   - Profile data fetching hook

2. Core Components

   - Profile header with user info
   - Basic stats display
   - Loading skeletons

3. Subject Management

   - Subject list/grid
   - Subject progress tracking
   - Add/remove subjects

4. Study Preferences

   - Preferences form
   - Settings panel
   - Notification controls

5. Polish & Optimization
   - Error boundaries
   - Loading states
   - Animations
   - Mobile responsiveness

## Files to Create

```
src/
├── app/
│   └── profile/
│       ├── layout.tsx
│       ├── page.tsx
│       └── settings/
│           └── page.tsx
├── components/
│   └── profile/
│       ├── ProfileHeader.tsx
│       ├── LoadingProfile.tsx
│       ├── SubjectDashboard.tsx
│       ├── StudyPreferences.tsx
│       └── ProfileStats.tsx
├── hooks/
│   ├── useProfile.ts
│   └── useProfileUpdate.ts
├── api/
│   └── user/
│       └── profile/
│           └── route.ts
└── types/
    └── profile.d.ts
```

## Additional Considerations

1. Authentication

   - Ensure middleware protects profile routes
   - Handle token expiration
   - Manage auth state

2. Data Management

   - Implement proper error handling
   - Add loading states
   - Handle data caching

3. Performance

   - Implement component lazy loading
   - Optimize data fetching
   - Add proper TypeScript types

4. Testing
   - Unit tests for components
   - Integration tests for API
   - E2E tests for critical flows
