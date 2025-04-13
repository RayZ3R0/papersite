# Search Results UI Design

## Main Layout

```
┌─────────────────────────────────────┐
│ Search Past Papers                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │🔍 Search papers...              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Smart Suggestions               │ │
│ │ • "phy u1" - Physics Unit 1    │ │
│ │ • "phy jan 24" - Latest Papers │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Matching Papers (12)                │
│ ┌─────────────────────────────────┐ │
│ │ Physics Unit 1                  │ │
│ │ ├─ January 2024                 │ │
│ │ │  └─ [Paper] [MS]             │ │
│ │ ├─ October 2023                 │ │
│ │ │  └─ [Paper] [MS]             │ │
│ │ └─ May 2023                     │ │
│ │    └─ [Paper] [MS]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Physics Unit 2                  │ │
│ │ ├─ January 2024                 │ │
│ │ │  └─ [Paper] [MS]             │ │
│ │ └─ October 2023                 │ │
│ │    └─ [Paper] [MS]             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Component Details

### 1. Search Input

```
┌─────────────────────────────────┐
│ 🔍 │ Search papers...          │
└─────────────────────────────────┘
```

- Clean, minimal design
- Large, easy to read font
- Search icon on the left
- Placeholder text suggests formats

### 2. Smart Suggestions

```
┌─────────────────────────────────┐
│ Try:                           │
│ • "phy u1"                     │
│ • "chem oct 23"                │
│ • "bio u2 jan 24"             │
└─────────────────────────────────┘
```

- Appears when typing
- Shows relevant suggestions
- Updates in real-time
- Click to apply suggestion

### 3. Results Header

```
Matching Papers (12)
Last updated: Jan 2024
```

- Clear count of results
- Latest paper date
- Sticky on scroll

### 4. Unit Groups

```
┌─────────────────────────────────┐
│ Physics Unit 1                  │
│ 3 papers available             │
├─────────────────────────────────┤
│ Papers list...                 │
└─────────────────────────────────┘
```

- Collapsible sections
- Paper count per unit
- Clear visual hierarchy

### 5. Paper Items

```
┌─────────────────────────────────┐
│ January 2024                    │
│ ├─ Question Paper [View] [PDF]  │
│ └─ Mark Scheme  [View] [PDF]    │
└─────────────────────────────────┘
```

- Session and year prominent
- Quick action buttons
- Download/view options
- Clean spacing

## Interactive Elements

### 1. Paper Actions

```
[View] [Download] [Annotate]
```

- Primary action: Annotate
- Secondary: View/Download
- Clear visual hierarchy
- Hover states

### 2. Unit Headers

```
[▼] Physics Unit 1 (3 papers)
```

- Expandable/collapsible
- Paper count
- Clear expand/collapse indicator
- Hover feedback

### 3. Loading States

```
┌─────────────────────────────────┐
│ ████████  ███████              │
│ ████  ████████                 │
└─────────────────────────────────┘
```

- Skeleton loading UI
- Smooth transitions
- Progress indicators

## Theme Support

- Uses theme-aware colors:

  - `text-text` for main text
  - `bg-surface` for backgrounds
  - `border-border` for borders
  - `text-primary` for actions
  - `bg-surface-alt` for hover states

- Consistent with site theme
- Dark/light mode support
- High contrast ratios

## Responsive Design

### Desktop

- Multi-column layout
- Hover effects
- Expanded details

### Tablet

- Single column
- Touch targets
- Collapsible sections

### Mobile

- Compact view
- Full-width items
- Touch-optimized
