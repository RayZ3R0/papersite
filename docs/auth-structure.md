# Authentication and User Management Structure

## Core Types and Data Models

### Registration and Profile Types

```typescript
// src/types/registration.ts
export interface UserSubjectConfig {
  subjectCode: string;
  units: {
    unitCode: string;
    examSession: ExamSession;
    planned: boolean;
    completed: boolean;
  }[];
}

export interface StudyPreferences {
  dailyStudyHours: number;
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  goalsEnabled: boolean;
  reminderEnabled: boolean;
  preferredExamSession: ExamSession;
}

export interface RegistrationData {
  email: string;
  username: string;
  password: string;
  subjects: UserSubjectConfig[];
  studyPreferences: StudyPreferences;
  verified: boolean;
  steps: RegistrationStep[];
}
```

### User Model

```typescript
// src/models/User.ts
interface UserDocument extends Document {
  email: string;
  username: string;
  password: string;
  subjects: UserSubjectConfig[];
  studyPreferences: StudyPreferences;
  role: "user" | "admin";
  verified: boolean;
  tokenVersion: number;
}
```

## Component Structure

### Authentication Components

```
src/components/auth/
├── AuthContext.tsx          # Global auth state management
├── LoginForm.tsx           # Login form with validation
├── RegisterForm.tsx        # Multi-step registration
├── AuthLayout.tsx          # Common auth page layout
└── registration/
    ├── BasicInfoStep.tsx   # Email, username, password
    ├── SubjectSelectionStep.tsx  # Subject selection
    └── StudyPreferencesStep.tsx  # Study preferences
```

### Profile Components

```
src/components/profile/
├── ProfileHeader.tsx       # User info display
├── ProfileStats.tsx       # Progress statistics
├── StudyPreferences.tsx   # Study settings
└── SubjectEditor/
    ├── EditSubjectsDialog.tsx  # Subject editing modal
    └── SubjectSelector.tsx     # Unit configuration
```

## API Routes

### Authentication

```
src/app/api/auth/
├── login/
│   └── route.ts           # Login with credentials
├── logout/
│   └── route.ts           # Clear auth tokens
├── refresh/
│   └── route.ts           # Refresh access token
├── register/
│   └── route.ts           # User registration
└── me/
    └── route.ts           # Get current user
```

### Profile Management

```
src/app/api/profile/
├── route.ts               # Update profile/preferences
└── password/
    └── route.ts          # Change password
```

## Auth Flow

1. Registration

   - Collect basic info (email, username, password)
   - Subject selection with unit configuration
   - Study preferences setup
   - Create user and set auth tokens

2. Login

   - Email/password validation
   - JWT token generation (access + refresh)
   - Cookie-based token storage

3. Profile Updates
   - Subject progress tracking
   - Unit completion status
   - Study preference modifications

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies for tokens
- Protected API routes
- Input validation
- CSRF protection

## Hooks and Utilities

```typescript
// src/hooks/useProfile.ts
export function useProfile() {
  // Fetch and cache user profile data
}

// src/hooks/useProfileUpdate.ts
export function useProfileUpdate() {
  // Handle profile updates with optimistic UI
}

// src/lib/auth/tokens.ts
export function createTokens(user: UserDocument) {
  // Generate access and refresh tokens
}

// src/lib/auth/cookies.ts
export function setCookies(res: NextResponse, access: string, refresh: string) {
  // Set secure HTTP-only cookies
}
```

## Profile Features

### Subject Management

- Subject selection with unit tracking
- Progress monitoring
- Exam session planning
- Unit completion status

### Study Preferences

- Daily study hours
- Preferred study time
- Goal tracking
- Exam session preferences

### Progress Tracking

- Unit completion statistics
- Subject-wise progress
- Overall completion percentage
- Study time tracking

## Admin Features

```
src/app/api/admin/
└── users/
    └── route.ts          # User management endpoints
```

## Frontend Pages

```
src/app/
├── auth/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── profile/
    ├── page.tsx          # Main profile view
    ├── academic/
    │   └── page.tsx      # Subject management
    └── settings/
        └── page.tsx      # User settings
```
