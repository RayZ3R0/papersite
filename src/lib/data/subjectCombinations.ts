import { mockSubjects } from './mock-subjects';

interface SubjectCombination {
  id: string;
  name: string;
  description: string;
  level: 'AS' | 'A2';
  subjectCodes: string[];
}

// Helper to find subject codes by pattern
const getSubjectCodes = (pattern: RegExp) => 
  mockSubjects.filter(s => pattern.test(s.code)).map(s => s.code);

export const commonCombinations: Record<string, SubjectCombination[]> = {
  'Mathematics': [
    {
      id: 'maths-as-p1p2-m1s1',
      name: 'Maths AS (with Mechanics)',
      description: 'Pure Mathematics 1 & 2 with Mechanics 1 and Statistics 1',
      level: 'AS',
      subjectCodes: ['P1', 'P2', 'M1', 'S1']
    },
    {
      id: 'maths-as-p1p2-s1s2',
      name: 'Maths AS (with Statistics)',
      description: 'Pure Mathematics 1 & 2 with Statistics 1 & 2',
      level: 'AS',
      subjectCodes: ['P1', 'P2', 'S1', 'S2']
    },
    {
      id: 'maths-a2-p3p4',
      name: 'Maths A2',
      description: 'Pure Mathematics 3 & 4',
      level: 'A2',
      subjectCodes: ['P3', 'P4']
    }
  ],

  'Further Mathematics': [
    {
      id: 'further-maths-as',
      name: 'Further Maths AS',
      description: 'Further Pure Mathematics 1',
      level: 'AS',
      subjectCodes: ['FP1']
    },
    {
      id: 'further-maths-a2',
      name: 'Further Maths A2',
      description: 'Further Pure Mathematics 2 & 3',
      level: 'A2',
      subjectCodes: ['FP2', 'FP3']
    }
  ],

  'Physics': [
    {
      id: 'physics-as',
      name: 'Physics AS',
      description: 'Units 1 & 2',
      level: 'AS',
      subjectCodes: getSubjectCodes(/^PH[12]$/)
    },
    {
      id: 'physics-a2',
      name: 'Physics A2',
      description: 'Units 4, 5 & 6',
      level: 'A2',
      subjectCodes: getSubjectCodes(/^PH[456]$/)
    }
  ],

  'Chemistry': [
    {
      id: 'chemistry-as',
      name: 'Chemistry AS',
      description: 'Units 1 & 2',
      level: 'AS',
      subjectCodes: getSubjectCodes(/^CH[12]$/)
    },
    {
      id: 'chemistry-a2',
      name: 'Chemistry A2',
      description: 'Units 4, 5 & 6',
      level: 'A2',
      subjectCodes: getSubjectCodes(/^CH[456]$/)
    }
  ]
};