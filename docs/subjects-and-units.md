# Subjects and Units Specification

## IAL Subject Categories

### Chemistry

```typescript
{
  code: 'CHEM',
  name: 'Chemistry',
  units: {
    AS: ['WCH11', 'WCH12', 'WCH13'],  // Units 1, 2, Lab
    A2: ['WCH14', 'WCH15', 'WCH16']   // Units 4, 5, Lab
  }
}
```

### Physics

```typescript
{
  code: 'PHYS',
  name: 'Physics',
  units: {
    AS: ['WPH11', 'WPH12', 'WPH13'],  // Units 1, 2, Lab
    A2: ['WPH14', 'WPH15', 'WPH16']   // Units 4, 5, Lab
  }
}
```

### Mathematics

```typescript
{
  code: 'MATH',
  name: 'Mathematics',
  units: {
    AS: ['WMA11', 'WMA12'],           // Pure 1, Pure 2
    A2: ['WMA13', 'WMA14']            // Pure 3, Pure 4
  }
}
```

### Further Mathematics

```typescript
{
  code: 'FMAT',
  name: 'Further Mathematics',
  units: {
    AS: ['WFM11', 'WFM12'],          // FP1, FP2
    A2: ['WFM13', 'WFM14']           // FP3, FP4
  }
}
```

## Unit Details

### Chemistry Units

- WCH11: Structure, Bonding and Introduction to Organic Chemistry
- WCH12: Energetics, Group Chemistry, Halogenoalkanes and Alcohols
- WCH13: Practical Skills in Chemistry I
- WCH14: Rates, Equilibria and Further Organic Chemistry
- WCH15: Transition Metals and Organic Nitrogen Chemistry
- WCH16: Practical Skills in Chemistry II

### Physics Units

- WPH11: Mechanics and Materials
- WPH12: Waves and Electricity
- WPH13: Practical Skills in Physics I
- WPH14: Further Mechanics and Thermal Physics
- WPH15: Fields and Particle Physics
- WPH16: Practical Skills in Physics II

### Mathematics Units

- WMA11: Pure Mathematics 1
- WMA12: Pure Mathematics 2
- WMA13: Pure Mathematics 3
- WMA14: Pure Mathematics 4

### Further Mathematics Units

- WFM11: Further Pure Mathematics 1
- WFM12: Further Pure Mathematics 2
- WFM13: Further Pure Mathematics 3
- WFM14: Further Pure Mathematics 4

## Grade Structure

```typescript
type Grade = "A*" | "A" | "B" | "C" | "D" | "E" | "U";

interface UnitGrade {
  unitCode: string;
  grade: Grade;
  percentage?: number;
  examSession: string;
}
```

## Exam Sessions

```typescript
interface ExamSession {
  id: string; // e.g., 'MAY2025'
  display: string; // e.g., 'May 2025'
  registrationStart: Date;
  registrationEnd: Date;
  examStart: Date;
  examEnd: Date;
  resultsDate: Date;
}
```

## User Subject Tracking

```typescript
interface UserSubject {
  subjectCode: string;
  level: "AS" | "A2";
  units: {
    unitCode: string;
    planned: boolean;
    completed: boolean;
    targetGrade: Grade;
    examSession: string;
    actualGrade?: Grade;
  }[];
  overallTarget: Grade;
  progress: number; // 0-100%
}
```

## Implementation Notes

1. Data Storage

   - Store subject/unit data in MongoDB
   - Cache frequently accessed data
   - Implement version control for updates

2. API Endpoints

   - GET /api/subjects - List all subjects
   - GET /api/subjects/:code - Get subject details
   - GET /api/units/:code - Get unit details
   - GET /api/sessions - List available sessions

3. Validation Rules

   - Unit combinations must be valid
   - Exam sessions must be available
   - Prerequisites must be met
   - Grade targets must be realistic

4. UI Considerations

   - Group subjects by category
   - Show unit dependencies
   - Indicate completion status
   - Display progress visually

5. Performance
   - Preload common subject data
   - Cache session information
   - Batch grade updates
   - Optimize queries
