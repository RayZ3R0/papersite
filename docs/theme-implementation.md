# Theme Implementation Plan

## Overview

Implement a theme system with dark mode support and the ability to add more themes later.

## Components

### 1. Theme Configuration

```typescript
// types/theme.ts
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    surface: string;
    border: string;
  };
}
```

### 2. Theme Provider

```typescript
// hooks/useTheme.ts
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themes: Theme[];
}
```

### 3. Files to Update

#### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        border: "var(--color-border)",
      },
    },
  },
};
```

#### CSS Variables

```css
/* globals.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f3f4f6;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
}

.dark {
  --color-primary: #60a5fa;
  --color-secondary: #9ca3af;
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text: #f3f4f6;
  --color-border: #374151;
}
```

## Implementation Steps

1. **Theme System Setup**

   - Create theme context and provider
   - Add local storage persistence
   - Implement theme switching logic
   - Add system theme detection

2. **UI Components**

   - Add theme toggle button to navbar
   - Create theme selector dropdown (for future themes)
   - Add transitions for theme changes

3. **Component Updates**
   - Update FilterBox component
   - Update PaperSearch component
   - Update SearchBox component
   - Update Layout components

### Dark Mode Classes to Add

#### FilterBox Component

```jsx
<div className="bg-surface dark:bg-surface text-text dark:text-text">
  <button className="bg-background dark:bg-surface hover:bg-surface
    dark:hover:bg-background/10">
```

#### SearchBox Component

```jsx
<input className="bg-background dark:bg-surface border-border
  dark:border-border/50 text-text dark:text-text">
```

#### Layout Component

```jsx
<div className="bg-background dark:bg-background text-text dark:text-text">
```

## Storage

```typescript
interface ThemeStorage {
  theme: string;
  lastUpdated: number;
}

const THEME_STORAGE_KEY = "papersite:theme";
```

## Theme Toggle Component

```jsx
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-surface dark:hover:bg-surface/20"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
```

## Future Theme Support

- Add theme presets (e.g., "Forest", "Ocean", "Desert")
- Allow custom theme creation
- Theme color picker
- Theme import/export

## Implementation Priorities

1. Basic dark mode support
2. Theme persistence
3. Smooth transitions
4. Additional themes

## Testing Requirements

1. Theme persistence across page reloads
2. System theme detection
3. Proper color contrast in all themes
4. Transition smoothness
5. Mobile compatibility

## Success Metrics

1. Theme switch response time < 100ms
2. No flashing during theme changes
3. Consistent styling across all components
4. Proper WCAG contrast ratios
5. High user satisfaction
