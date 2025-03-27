# Books Feature Implementation Plan

## Overview

Add a new Books section to PaperSite that displays academic books in a grid layout with interactive features.

## Data Structure

### Book Type Definition (src/types/book.d.ts)

```typescript
interface Book {
  id: string;
  title: string;
  imageUrl: string;
  pdfUrl: string;
  solutionUrl?: string; // Optional since some books won't have solutions
}
```

### Books Data (src/lib/data/books.json)

```json
{
  "books": [
    {
      "id": "book1",
      "title": "Example Book 1",
      "imageUrl": "/books/book1.jpg",
      "pdfUrl": "/pdfs/book1.pdf",
      "solutionUrl": "/pdfs/book1-solutions.pdf"
    }
  ]
}
```

## Component Architecture

```
src/
├── app/
│   └── books/
│       └── page.tsx         # Books page component
├── components/
│   └── books/
│       ├── BooksGrid.tsx    # Grid layout component
│       ├── BookCard.tsx     # Individual book card
│       └── SideTray.tsx     # Side tray with actions
└── types/
    └── book.d.ts           # Book type definitions
```

## Component Details

### 1. BooksGrid Component

- Responsive grid layout using CSS Grid
- Handles spacing and alignment of book cards
- Grid configuration:
  ```jsx
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {books.map((book) => (
      <BookCard key={book.id} book={book} />
    ))}
  </div>
  ```

### 2. BookCard Component

- Displays book image and title
- Handles card interactions
- Theme-aware styling
- Example structure:
  ```jsx
  <div className="relative bg-surface rounded-lg shadow-md overflow-hidden">
    <img
      src={book.imageUrl}
      alt={book.title}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-text">{book.title}</h3>
    </div>
    {/* Side tray component */}
  </div>
  ```

### 3. SideTray Component

- Slides out when book card is clicked
- Contains action buttons for PDF and solutions
- Smooth animation using CSS transitions
- Example animation:

  ```css
  .side-tray {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .side-tray.open {
    transform: translateX(0);
  }
  ```

## Navigation Updates

1. Add "Books" to desktop navigation in MainLayout.tsx
2. Add "Books" to mobile navigation in MobileNav.tsx

## Theme Integration

- Use theme CSS variables for consistent styling
- Support both light and dark modes
- Maintain proper contrast ratios
- Example theme classes:
  ```css
  .book-card {
    background-color: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
  }
  ```

## Asset Organization

```
public/
├── books/              # Book cover images
│   ├── book1.jpg
│   └── book2.jpg
└── pdfs/              # PDF files
    ├── book1.pdf
    └── book1-solutions.pdf
```

## Technical Considerations

### Performance

- Lazy load images using next/image
- Optimize PDF file sizes
- Consider pagination for large book collections

### Accessibility

- Proper focus management
- ARIA labels for interactive elements
- Keyboard navigation support

### Mobile Optimization

- Touch-friendly targets
- Appropriate spacing for mobile devices
- Smooth animations on mobile

## Implementation Steps

1. Create type definitions and data structure
2. Set up navigation updates
3. Implement base components
4. Add theme support
5. Implement interactive features
6. Add PDF handling
7. Test and optimize

## Success Criteria

1. Grid layout maintains integrity with side tray open
2. Smooth animations on all devices
3. Proper theme support
4. Accessible interaction model
5. Performance optimization metrics met
