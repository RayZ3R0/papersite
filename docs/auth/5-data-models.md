# Authentication Data Models & Types

## User Model

The User model (`models/User.ts`) defines the database schema and methods for user data:

```typescript
interface IUser {
  username: string;
  password: string;
  role: "user" | "moderator" | "admin";
  banned: boolean;
  createdAt: Date;
  lastLogin: Date;
  refreshToken?: {
    token: string;
    expiresAt: Date;
  };
  email?: string;
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  subjects?: UserSubjectConfig[];
  currentSession?: ExamSession;
  studyPreferences?: StudyPreferences;
}
```

### Subject Configuration

```typescript
interface UserSubjectConfig {
  subjectCode: string;
  level: "AS" | "A2";
  units: {
    unitCode: string;
    planned: boolean;
    completed: boolean;
    targetGrade: "A*" | "A" | "B" | "C" | "D" | "E";
    examSession: string;
    actualGrade?: string;
  }[];
  overallTarget: "A*" | "A" | "B" | "C" | "D" | "E";
}
```

### Study Preferences

```typescript
interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: "morning" | "afternoon" | "evening" | "night";
  notifications?: boolean;
}
```

### Model Methods

```typescript
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
}
```

## Authentication Types

### User Type (Without Password)

```typescript
interface UserWithoutPassword {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
}
```

### User Role

```typescript
type UserRole = "user" | "moderator" | "admin";
```

### Login Credentials

```typescript
interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  options?: {
    sessionDuration?: number; // Duration in seconds
  };
}
```

### Registration Data

```typescript
interface RegisterData {
  username: string;
  email: string;
  password: string;
}
```

### JWT Payload

```typescript
interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}
```

### Auth Error

```typescript
class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "USER_NOT_VERIFIED"
  | "ACCOUNT_DISABLED"
  | "INVALID_TOKEN"
  | "SERVER_ERROR";
```

## Database Schema Features

1. **Password Security**

   - Hashed using bcrypt
   - Salt rounds: 12
   - Never stored in plain text
   - Excluded from JSON responses

2. **Token Management**

   - Refresh tokens stored with expiry
   - Verification tokens for email confirmation
   - Password reset tokens with expiry

3. **User Tracking**

   - Creation date
   - Last login tracking
   - Account status (banned/verified)

4. **Educational Profile**
   - Subject configurations
   - Study preferences
   - Exam session tracking

## Type Safety

The system uses TypeScript throughout to ensure type safety:

1. **Model Types**

   - Mongoose schema types
   - Method interfaces
   - Document interfaces

2. **API Types**

   - Request/response types
   - Error types
   - Payload types

3. **Frontend Types**
   - Component props
   - Context types
   - Form data types

## Important Notes

1. **Schema Updates**

   - Always update types when modifying schema
   - Maintain backward compatibility
   - Consider migration needs

2. **Type Exports**

   - Keep types centralized
   - Use consistent naming
   - Document type changes

3. **Database Consistency**
   - Use MongoDB transactions where needed
   - Validate data before storage
   - Handle edge cases

Remember to:

- Update types when modifying the schema
- Maintain consistent type usage across the application
- Document any changes to data models
- Consider backwards compatibility
