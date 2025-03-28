# Mobile View Improvements

## Books Page Side Tray

### Current Issues

- Side tray covers entire card on mobile view
- Content gets cut off on smaller screens
- Overlay becomes too intrusive

### Planned Improvements

1. Scale down tray size on mobile:

   - Reduce width to 80% of screen on mobile
   - Add padding to prevent content from touching edges
   - Maintain half-card coverage on desktop

2. Responsive styling:

   ```css
   /* Desktop */
   md:w-1/2 md:right-0

   /* Mobile */
   w-[80%] right-[10%]
   ```

3. Layout adjustments:

   - Add proper spacing around content
   - Scale down text and image sizes for mobile
   - Improve touch targets

4. Animation tweaks:
   - Smoother transitions
   - Better positioning relative to parent card
   - Maintain context while overlay is active

### Implementation Notes

- Use Tailwind breakpoints for responsive design
- Test on various mobile screen sizes
- Ensure good UX on both portrait and landscape orientations
- Maintain accessibility standards
