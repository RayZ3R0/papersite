# Profile Page Design

## Overview

The profile page will be a comprehensive view of user information, study plans, and progress. The design should be engaging even when optional information is missing, using placeholder content to encourage completion.

## Layout Structure

### 1. Header Section

- Large profile header with user's name
- Join date and user role
- Quick action buttons (Edit Profile, Settings)
- Visual indicator of profile completion status

### 2. Subject & Study Information

- Grid layout for subjects with interactive cards
- If no subjects selected:
  - "Add Your Subjects" card with engaging illustration
  - Quick links to popular subject combinations

#### Subject Card Design

```
┌────────────────────────┐
│ Physics               ▾│
├────────────────────────┤
│ Units: 1, 2, 4        │
│ Target: A             │
│ Exam: May 2025        │
│                       │
│ [Progress Indicator]  │
└────────────────────────┘
```

### 3. Study Dashboard

- Study preferences display
- If not set:
  - "Personalize Your Study Plan" section
  - Suggested study schedules based on selected subjects

#### Study Schedule View

```
┌─────────────────────────────┐
│ Study Schedule             │
├─────────────────────────────┤
│ Preferred Time: Morning    │
│ Daily Goal: 3 hours       │
│ Notifications: Enabled     │
└─────────────────────────────┘
```

### 4. Progress Section

- Overall completion metrics
- Recent activity
- Study streaks and achievements
- Empty state shows motivational content and study tips

## UI Components

### 1. ProfileHeader

```typescript
interface ProfileHeaderProps {
  username: string;
  joinDate: Date;
  role: string;
  completionPercentage: number;
}
```

### 2. SubjectGrid

```typescript
interface SubjectGridProps {
  subjects: UserSubject[];
  onAddSubject: () => void;
  onEditSubject: (subject: UserSubject) => void;
}
```

### 3. StudyDashboard

```typescript
interface StudyDashboardProps {
  preferences: StudyPreferences;
  onUpdatePreferences: (prefs: StudyPreferences) => void;
}
```

### 4. ProgressMetrics

```typescript
interface ProgressMetricsProps {
  metrics: {
    studyStreak: number;
    totalStudyHours: number;
    completedUnits: number;
  };
}
```

## Empty States

### No Subjects Selected

```tsx
<EmptySubjects>
  <Illustration name="study" />
  <h3>Start Your Study Journey</h3>
  <p>Select your subjects to personalize your experience</p>
  <Button onClick={handleAddSubjects}>Add Subjects</Button>
  <PopularCombinations />
</EmptySubjects>
```

### No Study Preferences

```tsx
<EmptyPreferences>
  <h3>Optimize Your Study Time</h3>
  <p>Set your study preferences to get personalized recommendations</p>
  <StudyTimeSelector />
</EmptyPreferences>
```

## Theme Integration

### Color Scheme

- Use surface colors for cards and containers
- Primary color for actions and highlights
- Text hierarchy using text-\* classes
- Accent colors for progress indicators

### Components

```tsx
<div className="bg-surface border-border rounded-lg p-6">
  <h2 className="text-text font-bold">...</h2>
  <p className="text-text-muted">...</p>
  <button className="bg-primary text-white">...</button>
</div>
```

## Animations & Transitions

- Smooth transitions between states
- Loading skeletons for async data
- Progress bar animations
- Card hover effects

```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  className="transition-all duration-200"
>
  {/* Card Content */}
</motion.div>
```

## Responsive Design

### Desktop View (>1024px)

- Three-column layout
- Full statistics display
- Detailed progress charts

### Tablet View (768px-1024px)

- Two-column layout
- Condensed statistics
- Scrollable subject cards

### Mobile View (<768px)

- Single column layout
- Tabbed navigation for sections
- Simplified progress view

## API Integration

### Endpoints Needed

1. `/api/user/profile` - Get full profile data
2. `/api/user/subjects` - Manage subject selections
3. `/api/user/preferences` - Update study preferences
4. `/api/user/progress` - Get progress metrics

## Next Steps

1. Create Basic Components

   - Profile header
   - Subject cards
   - Progress indicators
   - Empty states

2. Implement Data Flow

   - Profile data fetching
   - Subject management
   - Preferences updates

3. Add Interactions

   - Edit functionality
   - Progress tracking
   - Achievement system

4. Polish & Optimize
   - Loading states
   - Error boundaries
   - Performance optimizations
