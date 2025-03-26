# Testing Guide for Past Papers Website

This document outlines the comprehensive testing strategy for the Past Papers Website project.

## Quick Start

```bash
# Run all tests
npm run test:all

# Run verification (used in pre-commit)
npm run verify

# Simulate different network conditions
npm run network-sim 4g
```

## Test Categories

### 1. Unit and Integration Tests

```bash
# Run all Jest tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 2. Device Compatibility Tests

```bash
# Test across different device sizes
npm run test:devices
```

Devices tested:

- Mobile (Portrait): 375x667
- Mobile (Landscape): 667x375
- Tablet: 768x1024
- Desktop: 1920x1080

### 3. Performance Testing

```bash
# Run performance tests
npm run test:performance
```

Success Criteria:

- PDF load time < 3 seconds on 4G
- Search response time < 500ms
- Maximum 2 taps to reach any paper
- Smooth scrolling and transitions

### 4. Network Condition Testing

```bash
# Start network simulation
npm run network-sim [profile]

Available profiles:
- fast-4g
- 4g
- slow-3g
- 2g
- terrible

# Clear network throttling
npm run network-sim clear
```

### 5. Touch Target Testing

```bash
# Verify touch target sizes
npm run test:touch
```

Requirements:

- All touch targets >= 44px
- Proper touch feedback
- Clear hit areas
- No overlapping targets

### 6. Accessibility Testing

```bash
# Run accessibility checks
npm run test:a11y
```

### 7. Offline Capability Testing

```bash
# Test offline functionality
npm run test:offline
```

## Continuous Integration

GitHub Actions automatically runs tests on:

- Push to main branch
- Pull request creation
- Daily scheduled runs

### CI Pipeline Steps:

1. Device compatibility tests
2. Performance tests
3. Network condition tests
4. Touch target validation
5. Accessibility checks
6. Offline functionality tests
7. E2E tests

## Pre-commit Checks

The project uses Husky to run pre-commit checks:

```bash
# Manual pre-commit check
npm run verify
```

Pre-commit checks include:

1. TypeScript compilation
2. Linting
3. Unit tests
4. Touch target validation
5. Critical performance checks

## Manual Testing Checklist

### Mobile Testing

- [ ] Test on actual mobile devices
- [ ] Verify touch interactions
- [ ] Check gesture support
- [ ] Test orientation changes
- [ ] Verify bottom navigation
- [ ] Check PDF view switching

### Network Testing

- [ ] Test on various network conditions
- [ ] Verify offline functionality
- [ ] Check loading indicators
- [ ] Test download feature
- [ ] Verify caching behavior

### PDF Viewing

- [ ] Test PDF loading performance
- [ ] Check side-by-side view on desktop
- [ ] Verify swipe between paper/scheme on mobile
- [ ] Test zoom functionality
- [ ] Verify download options

### Search and Navigation

- [ ] Test search response time
- [ ] Verify filter combinations
- [ ] Check URL-based navigation
- [ ] Test breadcrumb navigation
- [ ] Verify session/year selection

## Performance Monitoring

The application includes built-in performance monitoring:

```typescript
import { performanceMonitor } from "@/utils/performance";

// Log custom metrics
performanceMonitor.logMetric("custom-event", {
  duration: 500,
  details: "Additional info",
});

// Generate performance report
const report = performanceMonitor.generateReport();
```

## Testing Reports

Test reports are generated in JSON format and stored in:

```
test-reports/test-report-[timestamp].json
```

Report includes:

- Test results by category
- Performance metrics
- Touch target validation
- Network simulation results
- Accessibility issues

## Debug Tools

1. Network Simulation:

```bash
# Start throttling
npm run network-sim slow-3g

# Monitor network requests
performanceMonitor.logNavigationTiming();
```

2. Touch Target Visualization:

```bash
# Add data-testid to check elements
npm run test:touch -- --debug
```

3. Performance Monitoring:

```bash
# Watch performance metrics
npm run test:performance -- --watch
```

## Common Issues

1. PDF Loading Performance

- Check network simulation settings
- Verify caching implementation
- Monitor memory usage

2. Touch Target Size Issues

- Use minimum 44px for touch targets
- Check padding and margins
- Verify no overlapping targets

3. Network Handling

- Implement proper loading states
- Add retry mechanisms
- Test offline functionality

## Best Practices

1. Always run verify before committing:

```bash
npm run verify
```

2. Test on real mobile devices

3. Test under various network conditions

4. Monitor performance metrics regularly

5. Update test cases for new features

## Getting Help

If tests are failing:

1. Check the test report
2. Review console errors
3. Verify network conditions
4. Test on different devices
5. Review performance metrics

## Additional Resources

- Project Plan: `docs/plan.md`
- Performance Guide: `docs/performance.md`
- Mobile Testing Guide: `docs/mobile-testing.md`
