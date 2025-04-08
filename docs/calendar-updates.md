# Calendar Updates Implementation Plan

## Overview

Implementation plan for calendar improvements including default exam month, side drawer for exam details, and smart countdown display.

## 1. Calendar Default Month

```mermaid
sequenceDiagram
    participant Calendar as ExamCalendar
    participant Schedule as useExamSchedule
    participant Data as routineData

    Calendar->>Schedule: Initialize
    Schedule->>Data: Load exam data
    Schedule->>Schedule: Find next exam month
    Schedule->>Calendar: Set default month
```

### Changes Required:

- Modify ExamCalendar component to find next exam month on initialization
- Update currentDate state to default to that month
- Add logic to handle no upcoming exams case

## 2. Exam Details Drawer

```mermaid
sequenceDiagram
    participant Calendar as ExamCalendar
    participant DayCell as DayCell
    participant Drawer as ExamDetailsDrawer

    Calendar->>DayCell: User clicks date
    DayCell->>Drawer: Open drawer with date's exams
    Drawer->>Drawer: Display exam details
```

### Component Structure:

- New ExamDetailsDrawer component
- Responsive layout for mobile/desktop
- Exam information display:
  - Subject name and code
  - Exam title
  - Date and time
  - Duration
  - Room/venue
  - Special instructions

## 3. Smart Countdown Logic

```mermaid
sequenceDiagram
    participant Page as ExamsPage
    participant Profile as useProfile
    participant Schedule as useExamSchedule
    participant Timer as CountdownTimer

    Page->>Profile: Get user profile
    Profile->>Schedule: Pass user subjects
    Schedule->>Schedule: Filter relevant exams
    Schedule->>Timer: Display next relevant exam
```

### Hook Updates:

- Update useExamSchedule:
  - Filter exams by user subjects when logged in
  - Find absolute next exam when not logged in
  - Consider exam relevance from profile

### Component Updates:

- Modify CountdownTimer:
  - Accept targetExam prop
  - Show detailed exam info
  - Handle auth states

## 4. Mobile Optimizations

- Responsive drawer implementation
- Touch gesture support
- Optimized exam details display

## Next Steps

1. Create ExamDetailsDrawer component
2. Update ExamCalendar date selection
3. Modify useExamSchedule hook
4. Update CountdownTimer component
5. Add mobile optimizations
