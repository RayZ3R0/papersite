import { SubjectLevel, TargetGrade, ExamSession } from './registration';

// Constants for grades and exam sessions
export const GRADE_OPTIONS = ['A*', 'A', 'B', 'C', 'D', 'E'] as const;
export const SESSION_OPTIONS = [
  'January 2025',
  'May 2025',
  'June 2025',
  'October 2025',
  'January 2026',
  'May 2026',
  'June 2026'
] as const;

export interface UserUnit {
  unitCode: string;
  planned: boolean;
  completed: boolean;
  targetGrade: TargetGrade;
  examSession: ExamSession;
  actualGrade?: TargetGrade;
}

export interface ProfileSubjectConfig {
  subjectCode: string;
  level: SubjectLevel;
  overallTarget: TargetGrade;
  units: UserUnit[];
}

export interface UserProfile {
  subjects: ProfileSubjectConfig[];
  studyPreferences: {
    dailyStudyHours: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    notifications: boolean;
  };
}

// Re-export registration types that are needed
export type { SubjectLevel, TargetGrade, ExamSession };
