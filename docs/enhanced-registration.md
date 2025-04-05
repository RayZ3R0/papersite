# Enhanced Registration System Design

## Data Structures

### Exam Session Type

```typescript
type ExamSession =
  | "May 2025"
  | "October 2025"
  | "January 2026"
  | "May 2026"
  | "October 2026";
```

### Subject Structure

```typescript
interface Subject {
  code: string; // e.g., 'C12', 'P3'
  name: string; // e.g., 'Chemistry Unit 2', 'Physics Unit 3'
  type: "AS" | "A2"; // Level identifier
  category: "Chemistry" | "Physics" | "Mathematics" | "Further Mathematics";
}

interface UserSubject {
  subject: Subject;
  targetGrade: "A*" | "A" | "B" | "C" | "D" | "E";
  examSession: ExamSession;
}
```

### Updated User Schema

```typescript
interface IUser {
  // Existing fields...
  subjects?: UserSubject[];
  currentSession?: ExamSession;
  studyPreferences?: {
    dailyStudyHours?: number;
    preferredStudyTime?: "morning" | "afternoon" | "evening" | "night";
    notifications?: boolean;
  };
}
```

## Registration Flow

1. Basic Information (Step 1)

   - Username
   - Email
   - Password

2. Academic Profile (Step 2)

   - Current Exam Session
   - Subject Selection
     - Multi-select interface
     - Grouped by categories
     - Clear visual hierarchy

3. Unit Selection (Step 3)

   - For each selected subject:
     - Available units
     - Target grades
     - Exam sessions

4. Study Preferences (Step 4, Optional)
   - Daily study hours
   - Preferred study time
   - Notification preferences

## UI Components Needed

1. Subject Selection Component

   ```typescript
   interface SubjectSelectorProps {
     selectedSubjects: Subject[];
     onSelect: (subjects: Subject[]) => void;
     theme: ThemeConfig;
   }
   ```

2. Session Selector

   ```typescript
   interface SessionSelectorProps {
     currentSession: ExamSession;
     onChange: (session: ExamSession) => void;
     theme: ThemeConfig;
   }
   ```

3. Unit Configuration Panel

   ```typescript
   interface UnitConfigProps {
     subject: Subject;
     onConfigure: (config: UserSubject) => void;
     theme: ThemeConfig;
   }
   ```

4. Multi-step Form Navigation
   ```typescript
   interface StepNavigationProps {
     currentStep: number;
     totalSteps: number;
     onNext: () => void;
     onBack: () => void;
     progress: number;
     theme: ThemeConfig;
   }
   ```

## Theme Integration

- Use CSS variables from theme system
- Consistent color schemes across all steps
- Responsive design for all viewports
- Dark/light mode support
- Smooth transitions between steps

## API Endpoints

1. `/api/auth/register`

   - Updated to handle multi-step registration
   - Saves complete user profile

2. `/api/subjects`

   - Returns available subjects and units
   - Cached for performance

3. `/api/sessions`
   - Returns available exam sessions
   - Dynamically updated based on current date

## Next Steps

1. Update User Model

   - Add new fields for subjects and preferences
   - Add validation for new fields

2. Create UI Components

   - Build reusable components for each step
   - Implement theme integration
   - Add animations and transitions

3. Update API

   - Modify registration endpoint
   - Add new endpoints for subject data
   - Add validation middleware

4. Testing

   - Unit tests for new components
   - Integration tests for registration flow
   - E2E tests for complete registration

5. Documentation
   - Update API documentation
   - Add component storybook entries
   - Update user guide
