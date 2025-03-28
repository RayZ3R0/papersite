# Theme System Implementation

## Theme Types

```typescript
interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  "surface-alt": string;
  text: string;
  "text-muted": string;
  border: string;
}

interface Theme {
  name: string;
  label: string;
  colors: ThemeColors;
  swatches: string[]; // Preview colors
}

type ThemeName = "light" | "dark" | "matcha" | "nord" | "gruvbox" | "solarized";
```

## Theme Provider

### State Management

```typescript
interface ThemeState {
  theme: ThemeName;
  colors: ThemeColors;
  systemTheme: "light" | "dark";
  isInitialized: boolean;
}

interface ThemeContext {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colors: ThemeColors;
  isInitialized: boolean;
}
```

### Theme Definitions

```typescript
const THEME_COLORS: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    label: "Light",
    colors: {
      /* ... */
    },
    swatches: ["#ffffff", "#f8f9fa", "#e9ecef"],
  },
  dark: {
    name: "dark",
    label: "Dark",
    colors: {
      /* ... */
    },
    swatches: ["#1a1a1a", "#2d2d2d", "#404040"],
  },
  matcha: {
    name: "matcha",
    label: "Matcha",
    colors: {
      /* ... */
    },
    swatches: ["#98BB6C", "#1B1E1C", "#2C322D"],
  },
  nord: {
    name: "nord",
    label: "Nord",
    colors: {
      /* ... */
    },
    swatches: ["#88C0D0", "#2E3440", "#3B4252"],
  },
  gruvbox: {
    name: "gruvbox",
    label: "Gruvbox",
    colors: {
      /* ... */
    },
    swatches: ["#B8BB26", "#282828", "#3C3836"],
  },
  solarized: {
    name: "solarized",
    label: "Solarized",
    colors: {
      /* ... */
    },
    swatches: ["#2AA198", "#002B36", "#073642"],
  },
};
```

## Theme Picker Component

### Features

1. Theme Selection

   - List all available themes
   - Show current theme
   - Preview colors
   - Apply theme

2. System Theme Integration

   - Detect system theme
   - Auto switch option
   - Manual override

3. Theme Storage
   - Save to localStorage
   - Restore on page load
   - Default to system theme

### Components Structure

```
ThemePicker/
├── index.tsx          # Main component
├── ThemeButton.tsx    # Toggle button
├── ThemePanel.tsx     # Theme selection panel
├── ThemeOption.tsx    # Individual theme option
└── ColorSwatch.tsx    # Color preview dots
```

### Usage Example

```tsx
<ThemePicker>
  <ThemeButton>
    <CurrentThemeIcon />
    <span>Change Theme</span>
  </ThemeButton>

  <ThemePanel>
    {themes.map((theme) => (
      <ThemeOption
        key={theme.name}
        theme={theme}
        isActive={currentTheme === theme.name}
      >
        <ColorSwatch colors={theme.swatches} />
        <span>{theme.label}</span>
      </ThemeOption>
    ))}
  </ThemePanel>
</ThemePicker>
```

## CSS Variables

### Theme Colors

```css
:root {
  --primary: /* theme.colors.primary */ ;
  --background: /* theme.colors.background */ ;
  --surface: /* theme.colors.surface */ ;
  --surface-alt: /* theme.colors.surface-alt */ ;
  --text: /* theme.colors.text */ ;
  --text-muted: /* theme.colors.text-muted */ ;
  --border: /* theme.colors.border */ ;
}
```

### Animation

```css
/* Theme transition */
.theme-transition {
  transition: background-color 0.2s ease, color 0.2s ease,
    border-color 0.2s ease;
}
```

## Implementation Steps

1. Update Theme Types

   - Add new theme types
   - Add color swatch types
   - Update context types

2. Add Theme Definitions

   - Define new theme colors
   - Add preview swatches
   - Update default themes

3. Create New Components

   - Build theme picker UI
   - Add color previews
   - Implement animations

4. Update Theme Provider

   - Add new themes support
   - Update theme switching
   - Add system theme detection

5. Enhance User Experience
   - Add tooltips
   - Improve accessibility
   - Add mobile support
