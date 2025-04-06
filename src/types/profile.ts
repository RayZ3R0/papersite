export type Grade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E';
export type ExamSession = 'January' | 'May' | 'June' | 'October';

export const EXAM_SESSIONS = ['January', 'May', 'June', 'October'] as const;
export const GRADES = ['A*', 'A', 'B', 'C', 'D', 'E'] as const;

export interface UnitConfig {
  unitCode: string;
  planned: boolean;
  completed: boolean;
  targetGrade: Grade;
  examSession: string;
  actualGrade?: string;
}

export interface UserSubjectConfig {
  subjectCode: string;
  level: 'AS' | 'A2';
  overallTarget: Grade;
  units: UnitConfig[];
}

export interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  notifications?: boolean;
}

export interface ProfileData {
  user: {
    username: string;
    email?: string;
    verified: boolean;
    role: 'user' | 'moderator' | 'admin';
  };
  subjects: UserSubjectConfig[];
  currentSession?: ExamSession;
  studyPreferences?: StudyPreferences;
}

export type UnitUpdate = {
  subjectCode: string;
  unitCode: string;
  targetGrade?: Grade;
  examSession?: string;
  planned?: boolean;
  completed?: boolean;
  actualGrade?: string;
};

export type SubjectUpdate = {
  subjectCode: string;
  overallTarget?: Grade;
  level?: 'AS' | 'A2';
  units?: UnitConfig[];
};

export interface ProfileUpdate {
  subjects?: UserSubjectConfig[];
  studyPreferences?: StudyPreferences;
  currentSession?: ExamSession;
}