# PDF Viewer Implementation Plan

## 1. Component Structure

```mermaid
graph TD
  A[papers/[subject]/page.tsx] --> B[papers/view/page.tsx]
  B --> C[PDFViewer Component]
  C --> D[ViewerControls]
  C --> E[PDFRenderer]
  D --> F[ToggleViewMode]
  D --> G[DownloadButton]
  D --> H[PageControls]
```

## 2. Key Features

1. **PDF Display Modes**
   - Single PDF View (QP or MS)
   - Split View (QP and MS side by side)
   - Smooth transitions between modes
2. **View Controls**

   - Toggle between QP/MS in single view
   - Split view toggle
   - Download button with Ctrl+S shortcut
   - Page navigation controls

3. **URL Structure & Data Flow**

   ```
   // PDF Viewer URL
   /papers/view?type=qp&pdfUrl=[encoded_pdf_url]&msUrl=[encoded_ms_url]

   // Subject Page URL with state
   /papers/[subject]?unit=[unit_id]&years=[year1,year2]&session=[session]&expanded=[unit1,unit2]&scroll=[position]
   ```

   Implementation:

   ```typescript
   // In papers/[subject]/page.tsx
   const handleViewPDF = (paper: Paper) => {
     const encodedPDF = btoa(paper.pdf_url);
     const encodedMS = btoa(paper.marking_scheme_url);
     router.push(
       `/papers/view?type=qp&pdfUrl=${encodedPDF}&msUrl=${encodedMS}`
     );
   };
   ```

## 3. State Management in Subject Page

1. **URL State Persistence**

   ```typescript
   // In papers/[subject]/page.tsx
   const router = useRouter();
   const searchParams = useSearchParams();

   // Initialize state from URL params
   const [selectedUnit, setSelectedUnit] = useState<string | null>(
     searchParams.get("unit")
   );
   const [selectedYears, setSelectedYears] = useState<Set<number>>(
     new Set(searchParams.get("years")?.split(",").map(Number) || [])
   );
   const [selectedSession, setSelectedSession] = useState<string | null>(
     searchParams.get("session")
   );
   const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
     new Set(searchParams.get("expanded")?.split(",") || [])
   );

   // Scroll position management
   useEffect(() => {
     // Restore scroll position on mount
     const savedPosition = searchParams.get("scroll");
     if (savedPosition) {
       window.scrollTo(0, parseInt(savedPosition));
     }

     // Save scroll position on unmount
     const handleBeforeUnload = () => {
       const currentPosition = window.scrollY;
       const params = new URLSearchParams(window.location.search);
       params.set("scroll", currentPosition.toString());
       router.replace(`/papers/${subjectId}?${params.toString()}`, {
         scroll: false,
         shallow: true,
       });
     };

     window.addEventListener("beforeunload", handleBeforeUnload);
     return () =>
       window.removeEventListener("beforeunload", handleBeforeUnload);
   }, []);

   // Update URL when state changes
   useEffect(() => {
     const params = new URLSearchParams();
     if (selectedUnit) params.set("unit", selectedUnit);
     if (selectedYears.size > 0)
       params.set("years", Array.from(selectedYears).join(","));
     if (selectedSession) params.set("session", selectedSession);
     if (expandedUnits.size > 0)
       params.set("expanded", Array.from(expandedUnits).join(","));
     params.set("scroll", window.scrollY.toString());

     router.replace(`/papers/${subjectId}?${params.toString()}`, {
       scroll: false,
       shallow: true,
     });
   }, [selectedUnit, selectedYears, selectedSession, expandedUnits]);

   // Handle unit expansion
   const toggleUnit = (unitId: string) => {
     setExpandedUnits((prev) => {
       const newSet = new Set(prev);
       if (newSet.has(unitId)) {
         newSet.delete(unitId);
       } else {
         newSet.add(unitId);
       }
       return newSet;
     });
   };
   ```

2. **Benefits**
   - State persists across navigation (back/forward)
   - Scroll position preserved
   - Expanded units state maintained
   - Shareable URLs with complete state
   - No need for local storage
   - Clean browser history

## 4. Styling

Will use existing theme classes:

- Primary color buttons: `bg-primary text-white rounded-lg hover:opacity-90`
- Secondary buttons: `bg-secondary text-white rounded-lg hover:opacity-90`
- Surface backgrounds: `bg-surface`
- Border colors: `border-border`
- Text colors: `text-text` and `text-text-muted`

## 5. Implementation Steps

1. Update subject page with complete URL state management
   - Add scroll position tracking
   - Add expanded units tracking
2. Create new PDF viewer page
3. Modify paper buttons to navigate to viewer with encoded URLs
4. Implement PDF rendering with react-pdf
5. Add view mode controls
6. Implement keyboard shortcuts
7. Add download functionality
8. Style components to match theme

## 6. Component Details

**PDFViewer Component**

```typescript
interface PDFViewerProps {
  questionPaperUrl: string;
  markingSchemeUrl: string;
  initialView?: "qp" | "ms" | "split";
}
```

**ViewerControls Component**

```typescript
interface ViewerControlsProps {
  currentView: "qp" | "ms" | "split";
  onViewChange: (view: "qp" | "ms" | "split") => void;
  onDownload: () => void;
}
```

Note: All state in the subject page will be preserved in URL parameters for seamless navigation. This includes:

- Selected unit
- Selected years
- Selected session
- Expanded units
- Scroll position
