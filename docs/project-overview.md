# PaperSite Project Documentation

## Overview

PaperSite is a Next.js application for browsing and searching past papers. It features a modern, responsive interface with dark mode support and advanced search capabilities.

## Core Features

### 1. Search System

- **Quick Search**: Main page simple search with auto-redirect
- **Advanced Search**: Dedicated search page with filters
- **Search Suggestions**: Real-time suggestions as you type
- **Search History**: Recent and trending searches
- **Filters**:
  - Subject filters
  - Unit filters (subject-specific)
  - Session filters (time-based)
- **URL Integration**: Searchable and shareable URLs

### 2. Theme System

- **Dark Mode Support**: Full system-wide dark mode
- **Theme Persistence**: Saves in localStorage
- **System Theme Detection**: Matches system preference
- **Smooth Transitions**: Between theme changes
- **CSS Variables**: Theme-aware color system
- **Component Integration**: All components are theme-aware

### 3. Navigation

- **Desktop Navigation**: Full header menu
- **Mobile Navigation**: Bottom bar navigation
- **Responsive Design**: Adapts to all screen sizes
- **Keyboard Shortcuts**: (Planned feature)

## Architecture

### Component Structure

```
src/
├── app/                    # Next.js 13+ App Router pages
├── components/
│   ├── layout/            # Layout components
│   ├── search/            # Search components
│   └── pdf/              # PDF viewer components
├── hooks/                 # Custom React hooks
├── lib/                   # Data and utilities
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

### Key Components

#### 1. Search Components

`PaperSearch.tsx`

- Main search component with filters
- Handles search state and results
- Features:
  - Filter management
  - Results display
  - Search suggestions
  - Recent/trending searches

`SearchBox.tsx`

- Reusable search input component
- Features:
  - Suggestions dropdown
  - Keyboard navigation
  - Clear button
  - Auto-focus support

`FilterBox.tsx`

- Reusable filter component
- Features:
  - Multi-select support
  - Count badges
  - Mobile-friendly scrolling
  - Theme-aware styling

#### 2. Layout Components

`MainLayout.tsx`

- Root layout component
- Handles:
  - Navigation
  - Theme provider
  - Responsive design

`ThemeToggle.tsx`

- Theme switching button
- Features:
  - Animated icons
  - System theme detection
  - Theme persistence

#### 3. Page Components

`page.tsx` (Home)

- Landing page with:
  - Quick search
  - Subject grid
  - Quick links

`search/page.tsx`

- Advanced search page
- Features:
  - Full search interface
  - Filter system
  - Results display

`subjects/[subject]/page.tsx`

- Subject-specific page
- Features:
  - Unit listing
  - Paper organization
  - Quick filters

## Theme System

### Color Variables

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
}

.dark {
  --color-primary: #60a5fa;
  --color-secondary: #9ca3af;
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-border: #374151;
}
```

### Theme Hook

`useTheme.tsx`

- Manages theme state
- Handles system preference
- Provides theme context
- Features:
  - Theme persistence
  - System theme sync
  - Smooth transitions

## Search System

### Data Structure

```typescript
interface SearchQuery {
  text?: string;
  subject?: string;
  unit?: string;
  session?: string;
  year?: number;
}

interface SearchResult {
  paper: Paper;
  subject: Subject;
  unit: Unit;
  relevance: number;
}
```

### Search Hook

`useSearch.ts`

- Manages search state
- Features:
  - Debounced queries
  - Filter management
  - Results handling
  - Search history

### Search Utils

`queryParser.ts`

- Parses natural language queries
- Extracts:
  - Subject mentions
  - Unit references
  - Session/date information

## State Management

### Local Storage Keys

- `papersite:theme` - Theme preference
- `papersite:filters-visible` - Filter visibility state
- `papersite:recent-searches` - Recent search queries
- `papersite:trending-searches` - Trending search data

### URL Parameters

- `q` - Search query
- `subject` - Selected subject
- `unit` - Selected unit
- `session` - Selected session
- `focus` - Auto-focus flag

## Setup and Configuration

### Environment Variables

- None required for basic setup
- PDF viewer config (planned)
- API endpoints (planned)

### Build Configuration

- Next.js 13+ App Router
- TypeScript strict mode
- Tailwind CSS
- Jest for testing
- ESLint + Prettier

## Future Enhancements

1. **Theme System**

   - Custom theme creation
   - Theme presets
   - Theme export/import

2. **Search Features**

   - Advanced filters
   - Search analytics
   - Paper recommendations
   - Smart suggestions

3. **UI/UX**

   - Keyboard shortcuts
   - Gesture controls
   - Animations
   - Quick actions

4. **Data Management**
   - User preferences
   - Favorite papers
   - Study lists
   - Notes system

## Implementation Notes

### Performance Considerations

- Debounced search
- Memoized filters
- Lazy-loaded results
- Theme transition optimizations

### Accessibility

- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support

### Mobile Optimizations

- Touch-friendly controls
- Responsive layouts
- Mobile navigation
- Swipe gestures (planned)

### Browser Support

- Modern browsers
- IE11 not supported
- Progressive enhancement
- Fallback behaviors
