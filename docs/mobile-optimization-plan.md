# Mobile Calendar Optimization Plan

## DayCell Component Updates

### Desktop View (Preserve Existing)

- Keep all current features:
  - Date number
  - "Your Exam" badge
  - Exam pills (subject + time)
  - More indicator
  - Hover effects

### Mobile View Changes

```tsx
// DayCell.tsx updates
<div className="flex justify-between items-start mb-1">
  {/* Date number - always visible */}
  <span>...</span>

  {/* Your Exam badge - hide on mobile */}
  {hasRelevantExams && (
    <span className="hidden md:inline-block">
      Your Exam{relevantCount > 1 ? "s" : ""}
    </span>
  )}
</div>;

{
  /* Exam Pills - hide on mobile */
}
{
  hasExams && (
    <div className="hidden md:block space-y-1">
      {/* Existing exam pills code */}
    </div>
  );
}

{
  /* Mobile Exam Indicators */
}
{
  hasExams && (
    <div className="flex gap-1 md:hidden justify-center mt-1">
      {hasRelevantExams && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
      {exams.some((e) => !e.isRelevant) && (
        <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
      )}
    </div>
  );
}
```

### Mobile Indicators

- Simple dots to show exam presence
- Primary color for user's exams
- Muted color for other exams
- Keep cell background colors for relevance

## Implementation Notes

1. Keep All Desktop Features:

- Do not modify any desktop layout
- Use `hidden md:block` for desktop-only content
- Use `block md:hidden` for mobile-only content

2. Mobile Enhancements:

- Clean, minimal cell layout
- Touch-friendly hit areas
- Clear visual feedback
- Simple status indicators

3. Touch Interactions:

- Maintain full click area
- Keep hover effects for touch feedback
- Ensure consistent touch targets

4. Accessibility:

- Keep aria labels
- Maintain semantic HTML
- Preserve keyboard navigation

## Testing Requirements

1. Verify Desktop Layout:

- Nothing changes above md breakpoint
- All existing features work as before

2. Test Mobile Layout:

- Clean date display
- Clear exam indicators
- Proper touch interaction
- Smooth transitions to drawer

3. Transition Points:

- Check breakpoint behavior
- Ensure no layout shifts
- Verify content visibility
