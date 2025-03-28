# Navigation System Updates

## Layout Changes

### Main Layout Structure

```tsx
// PC Layout
<header>
  <nav className="hidden md:flex">
    <Logo />
    <MainNavLinks />
    <ThemePicker />
  </nav>
</header>

// Mobile Layout
<header>
  <nav className="flex md:hidden">
    <Logo />
    <ThemePicker />
  </nav>
  <MobileNav /> {/* At bottom of screen */}
</header>
```

### Navigation Links

```typescript
const mainNavLinks = [
  { href: "/books", label: "Books" },
  { href: "/subjects", label: "Subjects" },
  { href: "/papers", label: "Papers" },
  { href: "/forum", label: "Forum" },
  { href: "/search", label: "Search" },
];

// Mobile nav uses same links but different styling
```

## Logo Component

```tsx
const Logo = () => (
  <Link href="/" className="flex items-center">
    <Image
      src="/logo-placeholder.svg" // To be replaced with actual logo
      alt="Site Logo"
      width={32}
      height={32}
    />
  </Link>
);
```

## Implementation Steps

1. Create Logo:

   - Add placeholder SVG
   - Size appropriately for mobile/desktop
   - Link to homepage

2. Update MainLayout:

   - Remove title text on mobile
   - Add Logo component
   - Keep theme picker

3. Update MobileNav:

   - Remove Home link
   - Ensure Subjects link is visible
   - Keep bottom positioning
   - Maintain touch-friendly sizing

4. Style Adjustments:

   ```css
   /* Mobile Navigation */
   .mobile-nav {
     @apply fixed bottom-0 left-0 right-0;
     @apply flex justify-around items-center;
     @apply h-14 bg-surface shadow-lg;
     @apply safe-bottom; /* For devices with bottom safe area */
   }

   /* Logo */
   .logo {
     @apply w-8 h-8 md:w-10 md:h-10;
     @apply transition-transform hover:scale-110;
   }
   ```

## Responsive Behavior

### Desktop (md and up)

- Full navigation bar with all links
- Logo slightly larger
- Standard hover effects

### Mobile

- Logo in top bar with theme picker
- Bottom navigation with main links
- No home link (logo serves this purpose)
- Larger touch targets

## Accessibility

- Proper aria labels for logo
- Descriptive link text
- Sufficient touch targets (min 44px)
- High contrast for navigation items
- Clear active/hover states

## Future Considerations

1. Animated Logo:

   - Possible hover effects
   - Loading state animations
   - Theme-aware coloring

2. Navigation Enhancements:
   - Active link indicators
   - Scroll behavior
   - Nested navigation for subjects
