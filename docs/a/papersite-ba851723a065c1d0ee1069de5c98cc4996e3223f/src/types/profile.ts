import { ExamSession } from './sessions';
export type { ExamSession };
export type Grade = "A*" | "A" | "B" | "C" | "D" | "E";
export type SubjectLevel = "AS" | "A2";

export type UserUnit = {
  unitCode: string;
  planned: boolean;
  completed: boolean;
  targetGrade: Grade;
  examSession: ExamSession;
  actualGrade?: Grade;
};

export interface UserSubjectConfig {
  subjectCode: string;
  level: SubjectLevel;
  overallTarget: Grade;
  units: UserUnit[];
}

export interface UserProfile {
  subjects: UserSubjectConfig[];
  studyPreferences: {
    dailyStudyHours: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    notifications: boolean;
  };
}
