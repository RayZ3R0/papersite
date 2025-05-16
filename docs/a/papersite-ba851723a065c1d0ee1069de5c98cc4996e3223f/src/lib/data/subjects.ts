export interface Unit {
  code: string;      // e.g., 'WCH11'
  name: string;      // e.g., 'Structure, Bonding and Introduction to Organic Chemistry'
  level: 'AS' | 'A2';
  weight: number;    // Percentage weight in final grade
  practical?: boolean; // If it's a practical unit
}

export interface Subject {
  code: string;    // e.g., 'CHEM'
  name: string;    // e.g., 'Chemistry'
  category: 'Sciences' | 'Mathematics' | 'Economics' | 'Business' | 'Psychology' | 'Law' | 'English';
  units: Unit[];
}

export const IALSubjects: Subject[] = [
  {
    code: 'CHEM',
    name: 'Chemistry',
    category: 'Sciences',
    units: [
      {
        code: 'WCH11',
        name: 'Structure, Bonding and Introduction to Organic Chemistry',
        level: 'AS',
        weight: 40,
      },
      {
        code: 'WCH12',
        name: 'Energetics, Group Chemistry, Halogenoalkanes and Alcohols',
        level: 'AS',
        weight: 40,
      },
      {
        code: 'WCH13',
        name: 'Practical Skills in Chemistry I',
        level: 'AS',
        weight: 20,
        practical: true,
      },
      {
        code: 'WCH14',
        name: 'Rates, Equilibria and Further Organic Chemistry',
        level: 'A2',
        weight: 40,
      },
      {
        code: 'WCH15',
        name: 'Transition Metals and Organic Nitrogen Chemistry',
        level: 'A2',
        weight: 40,
      },
      {
        code: 'WCH16',
        name: 'Practical Skills in Chemistry II',
        level: 'A2',
        weight: 20,
        practical: true,
      },
    ],
  },
  {
    code: 'PHYS',
    name: 'Physics',
    category: 'Sciences',
    units: [
      {
        code: 'WPH11',
        name: 'Mechanics and Materials',
        level: 'AS',
        weight: 40,
      },
      {
        code: 'WPH12',
        name: 'Waves and Electricity',
        level: 'AS',
        weight: 40,
      },
      {
        code: 'WPH13',
        name: 'Practical Skills in Physics I',
        level: 'AS',
        weight: 20,
        practical: true,
      },
      {
        code: 'WPH14',
        name: 'Further Mechanics and Thermal Physics',
        level: 'A2',
        weight: 40,
      },
      {
        code: 'WPH15',
        name: 'Fields and Particle Physics',
        level: 'A2',
        weight: 40,
      },
      {
        code: 'WPH16',
        name: 'Practical Skills in Physics II',
        level: 'A2',
        weight: 20,
        practical: true,
      },
    ],
  },
  {
    code: 'MATH',
    name: 'Mathematics',
    category: 'Mathematics',
    units: [
      {
        code: 'WMA11',
        name: 'Pure Mathematics 1',
        level: 'AS',
        weight: 33.33,
      },
      {
        code: 'WMA12',
        name: 'Pure Mathematics 2',
        level: 'AS',
        weight: 33.33,
      },
      {
        code: 'WMA13',
        name: 'Statistics 1',
        level: 'AS',
        weight: 33.33,
      },
      {
        code: 'WMA14',
        name: 'Pure Mathematics 3',
        level: 'A2',
        weight: 33.33,
      },
      {
        code: 'WMA15',
        name: 'Statistics 2',
        level: 'A2',
        weight: 33.33,
      },
      {
        code: 'WMA16',
        name: 'Mechanics 1',
        level: 'A2',
        weight: 33.33,
      },
    ],
  },
  {
    code: 'FMAT',
    name: 'Further Mathematics',
    category: 'Mathematics',
    units: [
      {
        code: 'WFM11',
        name: 'Further Pure Mathematics 1',
        level: 'AS',
        weight: 33.33,
      },
      {
        code: 'WFM12',
        name: 'Further Pure Mathematics 2',
        level: 'AS',
        weight: 33.33,
      },
      {
        code: 'WFM13',
        name: 'Further Pure Mathematics 3',
        level: 'A2',
        weight: 33.33,
      }
    ],
  },
  // Add more subjects here
];

export const availableSessions = [
  'January 2025',
  'May/June 2025',
  'October 2025',
  'January 2026',
  'May/June 2026',
  'October 2026',
] as const;

export type ExamSession = typeof availableSessions[number];

// Helper functions
export function getSubjectByCode(code: string): Subject | undefined {
  return IALSubjects.find(subject => subject.code === code);
}

export function getUnitByCode(code: string): Unit | undefined {
  for (const subject of IALSubjects) {
    const unit = subject.units.find(unit => unit.code === code);
    if (unit) return unit;
  }
  return undefined;
}

export function getSubjectUnits(subjectCode: string, level?: 'AS' | 'A2'): Unit[] {
  const subject = getSubjectByCode(subjectCode);
  if (!subject) return [];
  if (!level) return subject.units;
  return subject.units.filter(unit => unit.level === level);
}