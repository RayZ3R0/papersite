# Paper Codes Implementation Plan

## Overview

Add paper codes to the papers listing and search results to show unit identifiers (e.g., WCH11, 6CH01) in a subtle way.

## Requirements

### Code Format

1. Papers from 2019 onwards:

   - Unit 1: WCH11 (Chemistry), WPH11 (Physics), WBI11 (Biology)
   - Unit 2: WCH12, WPH12, WBI12
   - And so on up to Unit 6

2. Papers before 2019 with IAL variants:

   - IAL papers: WCH01, WPH01, WBI01 etc.
   - Regular papers: 6CH01, 6PH01, 6BI01 etc.

3. Mathematics papers:
   - No codes needed

## Implementation Steps

1. Create Utility Function

```typescript
// src/utils/paperCodes.ts

export function getPaperCode(params: {
  subject: string;
  unitId: string;
  year: number;
  hasIALVariant: boolean;
  isIAL: boolean;
}): string | null {
  // Return null for mathematics
  if (subject.startsWith("math")) return null;

  // Get subject prefix
  const subjectPrefix =
    subject === "chemistry"
      ? "CH"
      : subject === "physics"
      ? "PH"
      : subject === "biology"
      ? "BI"
      : null;

  if (!subjectPrefix) return null;

  // Get unit number from unitId (e.g., "unit1" -> "1")
  const unitNumber = unitId.replace("unit", "");

  // Papers from 2019 onwards
  if (year >= 2019) {
    return `W${subjectPrefix}1${unitNumber}`;
  }

  // Papers before 2019 with IAL variant
  if (hasIALVariant) {
    return isIAL
      ? `W${subjectPrefix}0${unitNumber}`
      : `6${subjectPrefix}0${unitNumber}`;
  }

  return null;
}
```

2. Update Papers List View

- Location: `src/app/papers/[subject]/page.tsx`
- Add paper code below or next to session/year info
- Use small, muted text to keep it subtle

3. Update Search Results View

- Location: `src/components/search/PaperSearch.tsx`
- Add paper code to search results in a similar style
- Keep consistent with papers list view

## UI Design

The paper code should be displayed:

- In a smaller font size
- With muted/secondary text color
- As an additional detail that doesn't distract from primary information
- Consistently across both papers list and search results

Example:

```
Chemistry Unit 1 - June 2014
Session: June • Year: 2014 • WCH01
```

## Testing Plan

1. Test paper code generation:
   - 2019+ papers (all units)
   - Pre-2019 IAL variants
   - Pre-2019 regular papers
   - Mathematics papers (should return null)
2. UI Testing:
   - Verify code display in papers list
   - Verify code display in search results
   - Check responsiveness
   - Ensure consistent styling

## Next Steps

1. Switch to Code mode to implement utility function
2. Update papers list view
3. Update search results view
4. Add tests
