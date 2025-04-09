# Exam Details Drawer Improvements

## Overview

The ExamDetailsDrawer component needs enhancement to better highlight and prioritize the user's exam units. This document outlines the planned improvements and implementation details.

## Current Implementation

The drawer currently:

- Shows all exams in a single list
- Has basic styling for relevant exams (light primary color background)
- Displays exam details like subject, title, time, and duration
- Sorts exams by time (Morning/Afternoon)

## Proposed Improvements

### 1. Visual Separation

- **Two-Section Layout**
  - "Your Exams" section (sticky at top)
  - "Other Exams" section below
  - Clear visual separation between sections
  - Subtle background color for the sticky header

### 2. Enhanced Styling

- **User's Exam Cards**
  - Larger, more prominent card design
  - Enhanced shadows and borders
  - Stronger primary color accents
  - Better visual hierarchy
- **Time Slot Styling**

  - Morning: Warm accent colors (warning theme)
  - Afternoon: Cool accent colors (primary theme)
  - Clear visual distinction between slots

- **Status Indicators**
  - Priority badges
  - Visual countdown indicators
  - Quick-glance preparation status

### 3. Additional Information

- **Countdown Display**

  - Days/hours until exam
  - Progress indicators
  - Visual urgency cues

- **Exam Context**
  - Related subjects
  - Prerequisites if any
  - Study resources links

### 4. Navigation Features

- **Quick Navigation**
  - Jump between dates with user's exams
  - Calendar day navigation
  - Smooth scrolling between sections

## Component Structure

```typescript
// New Components
interface ExamSectionProps {
  title: string;
  exams: Examination[];
  isSticky?: boolean;
}

interface ExamCardProps extends Examination {
  showCountdown?: boolean;
  emphasis?: "high" | "normal";
}

interface CountdownProps {
  date: string;
  time: string;
}

interface QuickNavProps {
  dates: string[];
  currentDate: string;
  onDateChange: (date: string) => void;
}
```

## Implementation Steps

1. Create new component files:

   - ExamSection.tsx
   - ExamCard.tsx
   - CountdownTimer.tsx
   - QuickNav.tsx

2. Update ExamDetailsDrawer:

   - Implement two-section layout
   - Add sticky positioning
   - Integrate new components

3. Add styling improvements:

   - Enhanced card designs
   - Time slot theming
   - Status indicators

4. Implement navigation features:

   - Quick jump functionality
   - Smooth scrolling
   - Date navigation

5. Add new features:
   - Countdown timers
   - Status tracking
   - Context information

## Accessibility Considerations

- Maintain keyboard navigation
- Ensure proper ARIA labels
- Color contrast compliance
- Screen reader friendly structure

## Performance Optimizations

- Minimize rerenders
- Optimize animations
- Efficient date calculations
- Smart loading of exam data
