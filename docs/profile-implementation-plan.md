# Profile Page Implementation Plan

## Core Components Structure

### 1. ProfileHeader

```tsx
<ProfileHeader className="mb-8">
  <ProfileAvatar />
  <ProfileInfo>
    <ProfileStats />
    <ProfileActions />
  </ProfileInfo>
</ProfileHeader>
```

#### Empty State

- Default avatar with username initial
- Join date and basic stats
- Prompt to complete profile

### 2. SubjectDashboard

```tsx
<SubjectDashboard>
  <SubjectFilter />
  <SubjectGrid>
    {subjects.map((subject) => (
      <SubjectCard>
        <SubjectHeader />
        <SubjectProgress />
        <SubjectActions />
      </SubjectCard>
    ))}
  </SubjectGrid>
</SubjectDashboard>
```

#### Empty State

- "Start Your Journey" card
- Quick subject selection
- Popular combinations display
- Themed illustrations

### 3. StudyPreferences

```tsx
<StudyPreferences>
  <TimePreference />
  <GoalsSection />
  <NotificationSettings />
</StudyPreferences>
```

#### Empty State

- Study tips and recommendations
- Time management suggestions
- Quick setup button

## Implementation Phases

### Phase 1: Core Profile

1. Basic Layout

   ```tsx
   <div className="min-h-screen bg-surface">
     <div className="max-w-7xl mx-auto px-4 py-8">
       <ProfileHeader />
       <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <SubjectDashboard />
         <StudyInfo />
       </main>
     </div>
   </div>
   ```

2. Profile Header

   ```tsx
   <div className="bg-surface-alt rounded-xl p-6 border border-border">
     <div className="flex items-start gap-6">{/* Profile Content */}</div>
   </div>
   ```

3. Quick Stats
   ```tsx
   <div className="grid grid-cols-3 gap-4">
     <StatCard icon={<BookIcon />} value={subjects.length} label="Subjects" />
     {/* More stats */}
   </div>
   ```

### Phase 2: Subject Management

1. Subject Grid

   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {subjects.map((subject) => (
       <SubjectCard
         key={subject.id}
         className="bg-surface hover:bg-surface-alt transition-colors"
       >
         {/* Subject content */}
       </SubjectCard>
     ))}
   </div>
   ```

2. Progress Tracking
   ```tsx
   <div className="mt-4">
     <ProgressBar
       value={progress}
       className="bg-primary/10"
       barClassName="bg-primary"
     />
     <div className="flex justify-between text-sm text-text-muted">
       <span>Current: {progress}%</span>
       <span>Target: {target}%</span>
     </div>
   </div>
   ```

### Phase 3: Study Plan Integration

1. Time Management

   ```tsx
   <div className="grid gap-4">
     <TimeBlock
       day="Monday"
       slots={timeSlots}
       className="bg-surface-alt p-4 rounded-lg"
     />
     {/* More days */}
   </div>
   ```

2. Goals & Milestones
   ```tsx
   <div className="space-y-4">
     <GoalCard title="Complete AS Level" deadline="May 2025" progress={65} />
     {/* More goals */}
   </div>
   ```

## UI Components

### 1. Cards and Containers

```scss
.profile-card {
  @apply bg-surface rounded-xl border border-border p-6;
  @apply transition-shadow duration-200;
  @apply hover:shadow-lg hover:border-primary/20;
}

.stat-card {
  @apply bg-surface-alt rounded-lg p-4;
  @apply flex items-center gap-3;
}
```

### 2. Progress Indicators

```tsx
<CircularProgress
  value={75}
  size={64}
  strokeWidth={4}
  className="text-primary"
  bgClassName="text-primary/10"
/>
```

### 3. Interactive Elements

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="btn-primary"
>
  {/* Button content */}
</motion.button>
```

## Empty States

### 1. No Subjects Selected

```tsx
<EmptyState
  icon={<BookIcon className="w-12 h-12 text-primary/50" />}
  title="Start Your Study Journey"
  description="Select your subjects to get personalized recommendations"
  action={<SelectSubjectsButton />}
/>
```

### 2. No Study Plan

```tsx
<EmptyState
  icon={<CalendarIcon className="w-12 h-12 text-primary/50" />}
  title="Create Your Study Schedule"
  description="Plan your study time to improve productivity"
  action={<CreateScheduleButton />}
/>
```

## Data Management

### 1. Profile Data Structure

```typescript
interface ProfileData {
  user: {
    id: string;
    username: string;
    email: string;
    joinDate: Date;
    lastActive: Date;
  };
  subjects: UserSubject[];
  studyPlan?: StudyPlan;
  preferences?: StudyPreferences;
  progress: {
    bySubject: Record<string, SubjectProgress>;
    overall: number;
  };
}
```

### 2. API Integration

```typescript
async function fetchProfileData(): Promise<ProfileData> {
  const response = await fetch("/api/user/profile");
  return response.json();
}
```

## Theme Integration

### 1. Color Schemes

```typescript
const themeColors = {
  primary: "var(--primary)",
  surface: "var(--surface)",
  surfaceAlt: "var(--surface-alt)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  border: "var(--border)",
};
```

### 2. Component Theming

```tsx
<div
  className={`
    bg-surface
    dark:bg-surface-dark
    text-text
    dark:text-text-dark
    border-border
    dark:border-border-dark
  `}
>
  {/* Content */}
</div>
```

## Animations

### 1. Page Load

```typescript
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};
```

### 2. Component Transitions

```typescript
const cardVariants = {
  hover: { y: -4, shadow: "0 12px 24px rgba(0,0,0,0.1)" },
  tap: { scale: 0.98 },
};
```

## Responsive Design

### 1. Layout Grid

```scss
.profile-grid {
  @apply grid gap-6;
  @apply grid-cols-1;
  @apply md:grid-cols-2;
  @apply lg:grid-cols-3;
  @apply xl:grid-cols-4;
}
```

### 2. Component Adaptation

```scss
.subject-card {
  @apply flex-1 min-w-[280px];
  @apply md:max-w-[320px];
  @apply lg:max-w-none;
}
```

## Next Steps

1. Create Base Components

   - Profile layout
   - Card components
   - Progress indicators

2. Implement Core Features

   - Subject management
   - Progress tracking
   - Study plan display

3. Add Interactive Features

   - Edit capabilities
   - Real-time updates
   - Notification settings

4. Polish & Optimize
   - Loading states
   - Error boundaries
   - Performance optimization
