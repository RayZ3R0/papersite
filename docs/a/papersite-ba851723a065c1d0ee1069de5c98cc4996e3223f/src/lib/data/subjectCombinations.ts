import { registrationSubjects } from '@/components/auth/registration/subjectData';

interface SubjectCombination {
  id: string;
  name: string;
  description: string;
  level: 'AS' | 'A2';
  subjectCodes: string[];
}

// Helper to find sequential unit IDs
const getSequentialUnits = (subjectCode: string, prefix: string, numbers: number[]): string[] => {
  const subject = registrationSubjects[subjectCode];
  if (!subject) return [];
  
  return numbers
    .map(num => {
      const pattern = prefix + num;
      const unit = subject.units.find(u => u.id === pattern);
      return unit?.id;
    })
    .filter((id): id is string => id !== undefined);
};

export const commonCombinations: Record<string, SubjectCombination[]> = {
  'Mathematics': [
    {
      id: 'maths-as-pure-with-mechanics',
      name: 'Maths AS (with Mechanics)',
      description: 'Pure Mathematics 1 & 2 with Mechanics 1',
      level: 'AS',
      subjectCodes: [
        ...getSequentialUnits('YMA11', 'WMA1', [1, 2]),
        ...getSequentialUnits('YMA11', 'WME0', [1])
      ]
    },
    {
      id: 'maths-as-pure-with-stats',
      name: 'Maths AS (with Statistics)',
      description: 'Pure Mathematics 1 & 2 with Statistics 1',
      level: 'AS',
      subjectCodes: [
        ...getSequentialUnits('YMA11', 'WMA1', [1, 2]),
        ...getSequentialUnits('YMA11', 'WST0', [1])
      ]
    },
    {
      id: 'maths-a2-pure',
      name: 'Maths A2 (Pure)',
      description: 'Pure Mathematics 3 & 4',
      level: 'A2',
      subjectCodes: getSequentialUnits('YMA11', 'WMA1', [3, 4])
    }
  ],

  'Physics': [
    {
      id: 'physics-as',
      name: 'Physics AS',
      description: 'Units 1, 2 & 3',
      level: 'AS',
      subjectCodes: getSequentialUnits('YPH11', 'WPH1', [1, 2, 3])
    },
    {
      id: 'physics-a2',
      name: 'Physics A2',
      description: 'Units 4, 5 & 6',
      level: 'A2',
      subjectCodes: getSequentialUnits('YPH11', 'WPH1', [4, 5, 6])
    }
  ],

  'Chemistry': [
    {
      id: 'chemistry-as',
      name: 'Chemistry AS',
      description: 'Units 1, 2 & 3',
      level: 'AS',
      subjectCodes: getSequentialUnits('YCH11', 'WCH1', [1, 2, 3])
    },
    {
      id: 'chemistry-a2',
      name: 'Chemistry A2',
      description: 'Units 4, 5 & 6',
      level: 'A2',
      subjectCodes: getSequentialUnits('YCH11', 'WCH1', [4, 5, 6])
    }
  ],

  'Biology': [
    {
      id: 'biology-as',
      name: 'Biology AS',
      description: 'Units 1, 2 & 3',
      level: 'AS',
      subjectCodes: getSequentialUnits('YBI11', 'WBI1', [1, 2, 3])
    },
    {
      id: 'biology-a2',
      name: 'Biology A2',
      description: 'Units 4, 5 & 6',
      level: 'A2',
      subjectCodes: getSequentialUnits('YBI11', 'WBI1', [4, 5, 6])
    }
  ]
};
