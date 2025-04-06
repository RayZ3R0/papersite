# Subjects and Units Implementation

## Overview

Our application follows the Edexcel International A Level structure where:

- A subject (e.g., Physics, Chemistry) contains multiple units
- Each unit represents an individual exam component
- Units can be taken at different sessions throughout the year

## Data Structure

### Subject

```typescript
interface Subject {
  id: string; // e.g., "physics"
  name: string; // e.g., "Physics"
  units: Unit[]; // List of available units
}
```

### Unit

```typescript
interface Unit {
  id: string; // e.g., "unit1"
  name: string; // e.g., "Unit 1"
  description: string; // e.g., "Forces, Motion, and Energy"
  order: number; // For display ordering
}
```

### User's Subject Configuration

```typescript
interface UserSubjectConfig {
  subjectCode: string; // Reference to Subject
  level: "AS" | "A2"; // Study level
  overallTarget: Grade; // Target grade for subject
  units: UnitConfig[]; // Selected units
}
```

### Unit Configuration

```typescript
interface UnitConfig {
  unitCode: string; // Reference to Unit
  examSession: string; // When to take the exam (e.g., "May 2025")
  targetGrade: Grade; // Target grade for this unit
  actualGrade?: Grade; // Achieved grade (if completed)
  planned: boolean; // If planning to take
  completed: boolean; // If already taken
}
```

## Key Components

### EditSubjectsModal

- Allows selection of individual units from subjects
- Groups units by their parent subject
- Provides unit-level selection with exam session choice
- Shows unit descriptions and details

### SubjectDashboard

- Displays selected units grouped by subject and exam session
- Shows target grades and progress
- Lists unit details and status
- Manages overall subject configuration

### ProfileStats

- Shows total unit count
- Breaks down units by AS/A2 level
- Displays study preferences and goals

## Implementation Notes

1. **Unit Selection Process**

   - Users first see subjects grouped by category
   - Upon expanding a subject, they can select individual units
   - Each unit selection includes:
     - Target grade
     - Exam session
     - Completion status

2. **Session Organization**

   - Units are grouped by exam sessions
   - Sessions are ordered chronologically
   - Multiple units can be planned for the same session
   - Standard sessions: January, May, June, October

3. **Progress Tracking**

   - Each unit is tracked independently
   - No enforced completion order
   - Users can record actual grades for completed units

4. **User Interface Considerations**
   - Clear distinction between subjects and their units
   - Easy session and grade selection
   - Visual grouping by exam sessions
   - Clear target vs. actual grade display

## Future Improvements

1. **Unit Dependencies**

   - Add prerequisite relationships between units
   - Suggest recommended unit order

2. **Grade Analytics**

   - Add grade predictions based on performance
   - Show performance trends across sessions

3. **Session Planning**

   - Add workload analysis for selected sessions
   - Suggest balanced unit distribution

4. **Resource Integration**
   - Link units to relevant study materials
   - Connect to past paper database
   - Show examiner reports by unit
