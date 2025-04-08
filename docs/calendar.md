# Exam Calendar Implementation Plan

## Phase 1: Calendar Base & Default Month

### File Structure:

```
src/
├── hooks/
│   └── exam/
│       ├── useExamCalendar.ts    # Calendar state management
│       └── useExamSchedule.ts    # Exam data & filtering logic
├── components/
│   └── exam/
│       ├── ExamCalendar/
│       │   ├── Calendar.tsx      # Main calendar component
│       │   └── DayCell.tsx       # Individual day cell
│       └── ExamDetailsDrawer/
│           ├── index.tsx         # Drawer component
│           └── ExamDetails.tsx   # Exam details display
```

### Types Implementation:

```typescript
// src/types/exam.d.ts

export interface Examination {
  subject: string;
  code: string;
  title: string;
  date: string;
  day: string;
  time: "Morning" | "Afternoon";
  duration: string;
  isRelevant?: boolean;
}

export interface ExamState {
  view: "calendar" | "list";
  selectedDate?: string;
  filters: {
    subjects: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
    time: ("Morning" | "Afternoon")[];
  };
}

export interface CalendarViewProps {
  examinations: Examination[];
  userSubjects: UserSubjectConfig[];
  onDateSelect?: (date: string) => void;
  className?: string;
}
```

### useExamCalendar Hook:

```typescript
// src/hooks/exam/useExamCalendar.ts
"use client";

import { useState, useEffect } from "react";
import { parseISO, isBefore } from "date-fns";
import routineData from "@/lib/data/routine.json";

export function useExamCalendar() {
  // Get the earliest exam date from routine data
  const earliestExamDate = routineData.examinations.reduce((earliest, exam) => {
    const date = parseISO(exam.date);
    return !earliest || isBefore(date, earliest) ? date : earliest;
  }, null as Date | null);

  // Initialize state with earliest exam month or current date if no exams
  const [currentDate, setCurrentDate] = useState(
    earliestExamDate || new Date()
  );

  return {
    currentDate,
    setCurrentDate,
  };
}
```

### Calendar Component:

```typescript
// src/components/exam/ExamCalendar/Calendar.tsx
"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { CalendarViewProps } from "@/types/exam";
import DayCell from "./DayCell";
import { useExamCalendar } from "@/hooks/exam/useExamCalendar";

export function ExamCalendar({
  examinations,
  userSubjects,
  onDateSelect,
  className = "",
}: CalendarViewProps) {
  const { currentDate, setCurrentDate } = useExamCalendar();

  // Get days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group exams by date
  const examsByDate = examinations.reduce((acc, exam) => {
    const date = exam.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(exam);
    return acc;
  }, {} as Record<string, typeof examinations>);

  // Implementation continues...
}
```

### DayCell Component:

```typescript
// src/components/exam/ExamCalendar/DayCell.tsx
"use client";

import { format } from "date-fns";
import { DayCellProps } from "@/types/exam";

export default function DayCell({
  date,
  exams,
  isSelected,
  isToday,
  onClick,
  className = "",
}: DayCellProps) {
  const morningExams = exams.filter((exam) => exam.time === "Morning");
  const afternoonExams = exams.filter((exam) => exam.time === "Afternoon");

  return (
    <div
      className={`
            relative p-1 rounded-lg border transition-colors cursor-pointer
            hover:bg-surface/80 group
            ${isSelected ? "border-primary bg-primary/10" : "border-border"}
            ${isToday ? "ring-2 ring-primary ring-opacity-50" : ""}
            ${className}
        `}
    >
      {/* Cell content */}
    </div>
  );
}
```

## Phase 2: Exam Details Drawer

### Drawer Component:

```typescript
// src/components/exam/ExamDetailsDrawer/index.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Examination } from "@/types/exam";
import ExamDetails from "./ExamDetails";

interface ExamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
  exams: Examination[];
}

export function ExamDetailsDrawer({
  isOpen,
  onClose,
  date,
  exams,
}: ExamDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[540px]">
        {/* Drawer content */}
      </SheetContent>
    </Sheet>
  );
}
```

## Phase 3: User's Exam Integration

### Updated useExamSchedule Hook:

```typescript
// src/hooks/exam/useExamSchedule.ts
"use client";

export function useExamSchedule() {
  const { data: profile } = useProfile();
  const [examinations, setExaminations] =
    useState<Examination[]>(typedExaminations);

  // Mark user's exams
  useEffect(() => {
    if (!profile?.subjects) return;

    const userSubjects = profile.subjects.map((s) => s.subjectCode);
    const updatedExams = typedExaminations.map((exam) => ({
      ...exam,
      isRelevant: userSubjects.includes(exam.subject),
    }));

    setExaminations(updatedExams);
  }, [profile?.subjects]);

  // Calculate next exam
  const nextExam = useMemo(() => {
    const now = new Date();
    return examinations
      .filter((exam) => exam.isRelevant && new Date(exam.date) > now)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];
  }, [examinations]);

  return {
    examinations,
    nextExam,
    // ... other return values
  };
}
```

### Database Structure:

The existing database structure is already suitable for this implementation as it uses:

**User Profile:**

```typescript
interface UserProfile {
  subjects: UserSubjectConfig[];
  // ... other fields
}

interface UserSubjectConfig {
  subjectCode: string;
  level: SubjectLevel;
  // ... other fields
}
```

**Exam Data (from routine.json):**

```typescript
interface ExamData {
  subject: string;
  code: string;
  date: string;
  time: "Morning" | "Afternoon";
  // ... other fields
}
```

The connection between user subjects and exams is made through the subject codes, which allows for:

- Filtering relevant exams
- Highlighting user's exams in the calendar
- Showing only relevant exams in the countdown

## Implementation Sequence

### Phase 1: Calendar Base & Default Month

1. Implement useExamCalendar hook
2. Update Calendar component
3. Improve DayCell UI
4. Test basic calendar functionality

### Phase 2: Exam Details Drawer

1. Create Drawer components
2. Implement mobile-responsive layout
3. Add transitions and animations
4. Test drawer functionality

### Phase 3: User's Exam Integration

1. Update useExamSchedule with user subject filtering
2. Implement exam relevance marking
3. Update countdown timer logic
4. Test user-specific functionality

Each phase should be tested independently before moving on to the next to ensure stability and proper functionality.
