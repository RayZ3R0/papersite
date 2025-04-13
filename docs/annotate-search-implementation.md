# Enhanced Search Implementation Plan

## Search Pattern Support

1. Subject Name Only:

- Example: "physics", "chem", "bio"
- Shows all papers for that subject
- Supports partial matching ("phy" matches "physics")

2. Subject + Unit:

- Format: "[subject] u[number]"
- Examples:
  - "phy u1" - all Physics Unit 1 papers
  - "chem u2" - all Chemistry Unit 2 papers
  - "bio u3" - all Biology Unit 3 papers

3. Subject + Session/Year:

- Format: "[subject] [session] [year]"
- Examples:
  - "phy jan 24" - all Physics January 2024 papers
  - "chem oct 23" - all Chemistry October 2023 papers

4. Complete Search:

- Format: "[subject] u[number] [session] [year]"
- Examples:
  - "phy u1 jan 24" - Physics Unit 1 January 2024
  - "chem u2 oct 23" - Chemistry Unit 2 October 2023

## Search Parser Implementation

1. Create search pattern matchers:

```typescript
interface ParsedSearch {
  subject: string | null; // Matched subject code
  unit: number | null; // Unit number if specified
  session: string | null; // Session if specified
  year: number | null; // Year if specified
  isValid: boolean; // Whether the pattern is valid
}
```

2. Pattern Recognition:

```typescript
// Example patterns
const patterns = {
  subject: /^(phy|chem|bio|math|econ|psych|bus|acc)/i,
  unit: /u[1-6]/i,
  session: /(jan|june?|oct)/i,
  year: /\d{2,4}/,
};
```

## UI Enhancement

1. Real-time Search Results:

- Show matching papers as user types
- Group results by type:
  - Subject matches
  - Unit matches
  - Session/Year matches

2. Search Results Layout:

```
[Search Input with Smart Suggestions]

Matching Papers (12)
-------------------
Physics Unit 1
└─ January 2024
└─ October 2023
└─ May 2023

Physics Unit 2
└─ January 2024
└─ October 2023
```

3. Interactive Elements:

- Clickable unit headers
- Expandable sections
- Clear visual hierarchy

4. Visual Feedback:

- Loading states
- No results state
- Error states
- Search suggestions

## Search Optimization

1. Subject Name Matching:

- Maintain subject code map:

```typescript
const subjectCodes = {
  phy: "physics",
  chem: "chemistry",
  bio: "biology",
  // etc.
};
```

2. Smart Suggestions:

- Show relevant completions as user types
- Handle common misspellings
- Support abbreviations

3. Performance:

- Debounce search input
- Cache parsed results
- Memoize filtered papers

## Implementation Phases

1. Phase 1: Basic Pattern Matching

- Implement core search parser
- Add subject name matching
- Basic result display

2. Phase 2: Enhanced Patterns

- Add unit number support
- Add session/year support
- Improve pattern matching

3. Phase 3: UI Enhancement

- Implement new results layout
- Add animations and transitions
- Improve visual hierarchy

4. Phase 4: Optimizations

- Add smart suggestions
- Implement caching
- Performance improvements

## Usage Examples

```typescript
// Search parsing examples
parseSearch("phy"); // { subject: 'physics', unit: null, ... }
parseSearch("phy u1"); // { subject: 'physics', unit: 1, ... }
parseSearch("phy jan 24"); // { subject: 'physics', session: 'January', year: 2024 }
parseSearch("phy u1 jan 24"); // { subject: 'physics', unit: 1, session: 'January', year: 2024 }
```

This enhanced search system will provide a more intuitive and efficient way to find papers while maintaining a clean and responsive UI.
