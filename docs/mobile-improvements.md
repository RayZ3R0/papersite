# Mobile View Improvements

## Navigation Changes

### Top Navbar

- Replace text title with logo (links to home)
- Keep theme picker
- Clean minimal design
- Example:

```
[Logo] ---------------------- [Theme]
```

### Mobile Navigation

- Remove redundant Home link
- Add Subjects link
- Keep other important links
- Current order:

```
- Books
- Subjects
- Papers
- Forum
- Search
```

## New Notes Section

### Notes Page Structure

1. Similar to books page:

   - Subject filtering
   - Grid layout
   - Card-based design

2. Key differences:

   - Different card design for notes
   - Organization by chapters/topics
   - Quick preview option
   - Direct download links

3. Mobile considerations:
   - Easy navigation between topics
   - Clear topic hierarchy
   - Optimized preview for mobile

### Implementation Plan

1. Create new routes:

   - /notes
   - /notes/[subject]
   - /notes/[subject]/[topic]

2. Components needed:

   - NotesGrid
   - NoteCard
   - TopicFilter
   - NotesViewer

3. Data structure:

```typescript
interface Note {
  id: string;
  title: string;
  subject: string;
  topic: string;
  chapter?: string;
  downloadUrl: string;
  previewUrl?: string;
  tags?: string[];
}
```

### Mobile-First Design

- Use grid-cols-2 on mobile
- Larger touch targets
- Clear visual hierarchy
- Easy filtering system
- Quick access to downloads
