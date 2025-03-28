# Theme System Improvements

## New Themes

### Matcha

```typescript
{
  name: 'matcha',
  colors: {
    primary: '#98BB6C',
    background: '#1B1E1C',
    surface: '#2C322D',
    'surface-alt': '#333B34',
    text: '#C8D3C7',
    'text-muted': '#8A9889',
    border: '#404842'
  }
}
```

### Nord

```typescript
{
  name: 'nord',
  colors: {
    primary: '#88C0D0',
    background: '#2E3440',
    surface: '#3B4252',
    'surface-alt': '#434C5E',
    text: '#ECEFF4',
    'text-muted': '#D8DEE9',
    border: '#4C566A'
  }
}
```

### Gruvbox

```typescript
{
  name: 'gruvbox',
  colors: {
    primary: '#B8BB26',
    background: '#282828',
    surface: '#3C3836',
    'surface-alt': '#504945',
    text: '#EBDBB2',
    'text-muted': '#A89984',
    border: '#504945'
  }
}
```

### Solarized

```typescript
{
  name: 'solarized',
  colors: {
    primary: '#2AA198',
    background: '#002B36',
    surface: '#073642',
    'surface-alt': '#094652',
    text: '#93A1A1',
    'text-muted': '#657B83',
    border: '#094652'
  }
}
```

## Theme Picker UI Improvements

### Visual Changes

1. Color Palette Preview

   - Show main colors of each theme
   - Interactive hover states
   - Active theme indicator

2. Enhanced Visibility

   - Larger theme toggle button
   - More descriptive icon/label
   - Tooltip for new users

3. Theme Selection Panel
   ```html
   <div class="theme-panel">
     {themes.map(theme => (
     <button class="theme-option">
       <div class="theme-colors">
         <!-- Color swatches -->
       </div>
       <span class="theme-name">Theme Name</span>
     </button>
     ))}
   </div>
   ```

### Interaction Design

1. Click to open theme panel
2. Hover to preview colors
3. Click theme to apply
4. Smooth transitions
5. Persist selection

### Discovery Features

1. First-time user tooltip
2. Visual indicator for theme button
3. Brief animation on page load
4. "Customize theme" label

### Mobile Considerations

1. Larger touch targets
2. Full-width theme panel
3. Bottom sheet on mobile
4. Swipe gestures
