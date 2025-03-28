# Adding New Themes

## Steps to Add a New Theme

1. Add Theme Colors in `src/app/globals.css`:

```css
/* Your Theme Name */
.your-theme-name {
  --color-primary: #YOUR_COLOR;
  --color-primary-light: #YOUR_COLOR;
  --color-primary-dark: #YOUR_COLOR;

  --color-secondary: #YOUR_COLOR;
  --color-secondary-light: #YOUR_COLOR;
  --color-secondary-dark: #YOUR_COLOR;

  --color-background: #YOUR_COLOR;
  --color-background-alt: #YOUR_COLOR;

  --color-surface: #YOUR_COLOR;
  --color-surface-alt: #YOUR_COLOR;

  --color-text: #YOUR_COLOR;
  --color-text-muted: #YOUR_COLOR;

  --color-border: #YOUR_COLOR;
  --color-border-light: #YOUR_COLOR;
}
```

2. Update Theme Types in `src/hooks/useTheme.tsx`:

```typescript
export type Theme = 'light' | 'dark' | ... | 'your-theme-name';

export const themeNames: Record<Theme, string> = {
  // ...existing themes
  'your-theme-name': 'Your Theme Display Name',
};

// If it's a dark theme, add to darkThemes array
export const darkThemes: Theme[] = [
  'dark',
  // ...other dark themes
  'your-theme-name' // if it's dark
];
```

3. Add Theme to Cleanup List:
   In `src/hooks/useTheme.tsx`, update the classList.remove call:

```typescript
document.documentElement.classList.remove(
  "light",
  "dark",
  "catppuccin-latte",
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "catppuccin-mocha",
  "matcha",
  "nord",
  "gruvbox",
  "your-theme-name" // Add your theme here
);
```

## Theme Guidelines

1. Color Variables:

   - All color variables must be defined
   - Use same variable names as other themes
   - Keep consistent naming pattern

2. Class Names:

   - Use simple, kebab-case names
   - Avoid using `:root` selectors
   - Place inside `@layer base` in globals.css

3. Dark/Light Mode:

   - Add theme to darkThemes if it's dark
   - Light themes get light mode styles
   - Dark themes get dark mode styles

4. Color Recommendations:
   - Primary: Main accent color
   - Secondary: Supporting accent color
   - Background: Page background
   - Surface: Card/component background
   - Text: Text colors with good contrast
   - Border: Subtle borders and dividers

## Testing Themes

1. Verify Transitions:

   - Theme switches smoothly
   - No flickering or stuck styles
   - Proper cleanup of old theme

2. Check Contrast:

   - Text is readable
   - Elements are distinguishable
   - Meets accessibility standards

3. Test Components:

   - Buttons and interactive elements
   - Cards and containers
   - Icons and graphics
   - Form elements

4. Cross-browser Testing:
   - Test in multiple browsers
   - Check mobile devices
   - Verify dark mode detection

## Common Issues

1. Theme Not Switching:

   - Ensure theme is added to cleanup list
   - Check class name consistency
   - Verify CSS variables are complete

2. Visual Glitches:

   - Check transition classes
   - Verify color variable names
   - Test with different components

3. Dark Mode Issues:
   - Add to darkThemes if needed
   - Check contrast ratios
   - Test system theme detection
