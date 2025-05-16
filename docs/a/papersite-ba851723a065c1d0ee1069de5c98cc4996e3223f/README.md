# Past Papers Website

A mobile-responsive website for organizing and accessing past papers across multiple subjects and units, with PDF storage on Bunkr.

## Features

- Multiple subjects with unit organization (10+ subjects, ~6 units each)
- Mobile-first design with responsive PDF viewing
- Side-by-side papers and marking schemes
- Fast search and intuitive navigation
- Offline capabilities
- Performance monitoring

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing and Validation

We have comprehensive testing tools to ensure quality. See [TESTING.md](./TESTING.md) for detailed information.

```bash
# Run all tests and validations
npm run check-all

# Run specific test categories
npm run test:devices     # Test device compatibility
npm run test:performance # Test performance metrics
npm run test:network    # Test network conditions
npm run test:touch      # Validate touch targets
npm run test:offline    # Test offline functionality

# Simulate different network conditions
npm run network-sim 4g  # Simulate 4G network
npm run network-sim slow-3g  # Simulate slow 3G

# Validate implementation against requirements
npm run validate
```

## Critical Success Metrics

- PDF load time < 3 seconds on 4G
- Maximum 2 taps to reach any paper
- Touch targets >= 44px
- Search response < 500ms
- Zero missing unit assignments
- 100% paper-scheme pairing accuracy

## Development Guidelines

1. Always run verification before committing:

```bash
npm run verify
```

2. Test thoroughly on mobile devices:

- Touch interactions
- Swipe gestures
- Orientation changes
- Network conditions
- Offline mode

3. Follow mobile-first approach:

- Design for mobile first
- Enhance for larger screens
- Test responsive breakpoints
- Verify touch targets

4. Monitor performance:

- Use performance monitoring tools
- Check network requests
- Validate loading times
- Test under poor conditions

## Project Structure

```
src/
├── app/          # Next.js app router
├── components/   # React components
├── lib/         # Data and utilities
├── hooks/       # Custom React hooks
├── types/       # TypeScript types
└── utils/       # Helper functions
```

## Testing Infrastructure

```
scripts/
├── test-all.ts           # Run all tests
├── verify.ts            # Pre-commit verification
├── network-sim.ts       # Network simulation
└── validate-implementation.ts  # Requirements validation

tests/
└── **/*.test.tsx       # Test files
```

## Adding New Content

1. Update subject data in `src/lib/data/subjects.json`:

```typescript
{
  "subjects": {
    "subject-id": {
      "name": "Subject Name",
      "units": [
        {
          "id": "unit1",
          "name": "Unit Name",
          "order": 1
        }
      ],
      "papers": [
        {
          "id": "paper-id",
          "unitId": "unit1",
          "year": 2024,
          "session": "January",
          "pdfUrl": "url-to-pdf",
          "markingSchemeUrl": "url-to-scheme"
        }
      ]
    }
  }
}
```

2. Run validation:

```bash
npm run validate
```

## Performance Monitoring

The app includes built-in performance monitoring:

```typescript
import { performanceMonitor } from "@/utils/performance";

// Log custom metrics
performanceMonitor.logMetric("custom-event", {
  duration: 500,
  details: "Additional info",
});
```

## Contributing

1. Create a new branch
2. Make changes
3. Run verification: `npm run verify`
4. Run all tests: `npm run test:all`
5. Validate implementation: `npm run validate`
6. Submit pull request

## Important Notes

- Always test on real mobile devices
- Verify touch target sizes (>= 44px)
- Test under various network conditions
- Check offline functionality
- Monitor performance metrics
- Keep PDF load times under 3 seconds
- Ensure proper error handling
- Maintain accessibility standards

## Getting Help

If you encounter issues:

1. Check test reports in `test-reports/`
2. Review console errors
3. Verify network conditions
4. Test on multiple devices
5. Check performance metrics
6. Read [TESTING.md](./TESTING.md)

## License

This project is private and confidential.
