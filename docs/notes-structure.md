# Notes System Structure

## Data Organization

### Hierarchical Structure

```
Subject
└── Unit 1
    ├── Topic 1
    │   ├── PDF 1
    │   └── PDF 2
    └── Topic 2
        └── PDF 1
└── Unit 2
    ├── Complete Unit PDF
    └── Topic 1
        └── PDF 1
```

## Data Models

### Subject

```typescript
interface Subject {
  id: string;
  name: string;
  description?: string;
  units: Unit[];
}
```

### Unit

```typescript
interface Unit {
  id: string;
  name: string;
  number: number;
  description?: string;
  // Optional complete unit PDF
  unitPdf?: {
    title: string;
    downloadUrl: string;
    previewImage?: string;
  };
  topics: Topic[];
}
```

### Topic

```typescript
interface Topic {
  id: string;
  name: string;
  description?: string;
  resources: Resource[];
}
```

### Resource (PDF)

```typescript
interface Resource {
  id: string;
  title: string;
  type: "pdf";
  downloadUrl: string;
  previewImage?: string;
  tags?: string[];
}
```

## UI Organization

### Desktop Layout

```
+------------------+----------------------+
|                 |                      |
| Subject Filter  |                      |
|                 |                      |
|-----------------|    Notes Grid        |
|                 |                      |
| Unit Filter     |                      |
|                 |                      |
+------------------+----------------------+
```

### Mobile Layout

```
+---------------------------------+
|        Subject Dropdown         |
+---------------------------------+
|         Unit Dropdown          |
+---------------------------------+
|                                 |
|          Notes Grid            |
|                                 |
+---------------------------------+
```

## Features

### Filtering

1. Subject Selection

   - Main filter at top level
   - Shows available units for selected subject

2. Unit Selection

   - Secondary filter
   - Shows topics and resources within unit

3. View Options
   - Grid view for PDFs
   - List view for better organization
   - Tree view for hierarchical browsing

### Note Types

1. Complete Unit Notes

   - Single PDF covering entire unit
   - Prominent display when available

2. Topic-wise Notes

   - Multiple PDFs per topic
   - Organized under topic sections

3. Supplementary Resources
   - Additional PDFs for specific topics
   - Tagged for easy filtering

## User Experience

### Navigation

1. Subject Selection

   - Quick dropdown for mobile
   - Persistent sidebar for desktop
   - Shows count of available units/topics

2. Unit Browsing

   - Expandable sections
   - Shows topics and available PDFs
   - Quick preview of content structure

3. PDF Access
   - Direct download links
   - Preview when available
   - Clear labeling and organization

### Mobile Optimization

1. Collapsible Filters

   - Easy access to subject/unit selection
   - Smooth transitions

2. Compact Card Design

   - Essential information only
   - Clear download buttons
   - Touch-friendly targets

3. Progressive Disclosure
   - Show relevant information based on context
   - Avoid overwhelming with too many options
