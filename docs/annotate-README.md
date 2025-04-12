# Annotate Page Enhancement

## Overview

Enhanced version of the /annotate page that provides a clean, searchable interface for past papers while maintaining the PDF annotation functionality.

## 📚 Documentation

### Implementation Guides

1. [Enhancement Plan](./annotate-page-enhancement-plan.md) - Overall architecture and phases
2. [Phase 1 Steps](./annotate-phase1-steps.md) - Detailed steps for Phase 1
3. [Component Details](./annotate-page-components.md) - Component specifications
4. [Layout Implementation](./annotate-layout-implementation.md) - Layout structure
5. [State Management](./annotate-state-management.md) - State architecture
6. [Test Plan](./annotate-test-plan.md) - Testing strategy
7. [Implementation Summary](./annotate-implementation-summary.md) - Quick reference
8. [Validation Checklist](./annotate-validation-checklist.md) - Quality checks

## 🏗️ Project Structure

```
src/
  components/
    annotate/           # New components
      layout/           # Layout components
        Header.tsx
        Sidebar.tsx
        MainContent.tsx
      browser/         # Paper browsing
        SubjectGrid.tsx
        UnitList.tsx
      search/          # Search functionality
        SearchContainer.tsx
        FilterPanel.tsx

  app/
    annotate/          # Page components
      layout.tsx       # Root layout
      page.tsx         # Main page
      [subject]/       # Dynamic routes
        page.tsx
```

## 🚀 Getting Started

1. **Development Setup**

   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

2. **Running Tests**

   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npm test Header.test.tsx

   # Test coverage
   npm test -- --coverage
   ```

3. **Building**

   ```bash
   # Production build
   npm run build

   # Type checking
   npm run type-check
   ```

## 🎯 Key Features

- Clean, intuitive UI matching site theme
- Fast, responsive search functionality
- Advanced filtering options
- Seamless PDF viewer integration
- Mobile-first responsive design
- Accessible interface
- Dark mode support

## 💻 Development Guidelines

### Code Style

- Use TypeScript strictly
- Follow existing naming conventions
- Maintain consistent spacing
- Document components and functions
- Write unit tests

### Component Structure

```typescript
// Template for new components
import React from "react";
import type { ComponentProps } from "./types";

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Component logic
  return <div className="component-root">{/* Component content */}</div>;
};
```

### CSS Classes

Use existing theme classes:

```typescript
const commonClasses = {
  container: "container mx-auto px-4",
  card: "rounded-lg border bg-card p-4",
  button: "rounded-md bg-primary px-4 py-2",
};
```

## 🔍 Testing

### Unit Tests

- Test each component in isolation
- Mock dependencies
- Test error states
- Verify accessibility

### Integration Tests

- Test component interactions
- Verify data flow
- Test routing
- Check state management

### E2E Tests

- Test critical user paths
- Verify PDF integration
- Test search functionality
- Check responsiveness

## 🎨 Design System

Follow the existing design system:

### Colors

```css
--primary: theme("colors.blue.600");
--background: theme("colors.white");
--text: theme("colors.gray.900");
```

### Typography

```css
--font-sans: "Inter", system-ui;
--text-base: 1rem;
--text-lg: 1.125rem;
```

### Spacing

```css
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
```

## 🔧 Common Issues & Solutions

### 1. PDF Viewer Integration

```typescript
// Ensure proper cleanup
useEffect(() => {
  return () => {
    // Cleanup code
  };
}, []);
```

### 2. State Management

```typescript
// Use selectors for performance
const searchQuery = useAnnotateStore((state) => state.searchQuery);
```

### 3. Mobile Navigation

```typescript
// Handle mobile menu
const [isOpen, setIsOpen] = useState(false);
```

## 📈 Performance Considerations

1. **Code Splitting**

   - Use dynamic imports
   - Lazy load components
   - Route-based splitting

2. **State Management**

   - Use selectors
   - Implement memoization
   - Batch updates

3. **Asset Optimization**
   - Optimize images
   - Use WebP format
   - Implement lazy loading

## 🔐 Security Checks

1. **Input Validation**

   - Sanitize user input
   - Validate file uploads
   - Check URL parameters

2. **Error Handling**
   - Use error boundaries
   - Log errors safely
   - Show user-friendly messages

## 📝 Contributing

1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Submit pull request

## 🚨 Important Notes

- Do not modify existing PDF annotation functionality
- Maintain separation of concerns
- Test thoroughly before deployment
- Keep documentation updated
- Follow accessibility guidelines
- Monitor performance metrics

## 📞 Support

- Check documentation first
- Review existing issues
- Create detailed bug reports
- Include reproduction steps

## 📊 Metrics & Analytics

Track:

- Page load times
- Search usage
- PDF view counts
- Error rates
- User paths
- Performance metrics
