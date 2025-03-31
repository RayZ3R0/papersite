# Auth System Improvements

## LoginModal Theme Integration

Current issues:

- Hard-coded colors don't match project theme
- Background shows error state before auth
- Dark mode support needs improvement

### Planned Changes

1. Update LoginModal classes:

```tsx
// Replace hardcoded colors with theme variables
className = "bg-surface text-text"; // Instead of bg-white dark:bg-gray-800
className = "border-divider"; // Instead of border-gray-200 dark:border-gray-700
className = "bg-primary/10"; // Instead of bg-blue-50 dark:bg-blue-900/20
className = "text-primary"; // Instead of text-blue-600 dark:text-blue-400
```

2. Update backdrop to use theme colors:

```tsx
className = "bg-background/50"; // Instead of bg-black/50
```

## Forum Pre-Auth State

Current issues:

- Shows error state behind login modal
- Attempts to fetch posts before auth
- Poor user experience

### Planned Changes

1. Update forum page to show placeholder content:

```tsx
// Show engaging placeholder when not authenticated
<div className="text-center py-12">
  <h2 className="text-2xl font-bold mb-4">Join the Discussion</h2>
  <p className="text-text-muted mb-6">
    Connect with others, share your thoughts, and explore topics together.
  </p>
  {/* Login prompt will be shown by ProtectedContent */}
</div>
```

2. Only fetch posts when user is authenticated:

```tsx
useEffect(() => {
  if (user) {
    // Only fetch when authenticated
    fetchPosts();
  }
}, [user]);
```

## Implementation Steps

1. Switch to Code mode to update components
2. Test dark/light theme consistency
3. Verify auth flow and user experience
4. Ensure proper loading states

## Expected Outcome

- Consistent theme across all auth components
- Better pre-auth user experience
- No error states visible during auth flow
- Seamless integration with project's design system
