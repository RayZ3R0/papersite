// Exam Session Options
export type ExamSession =
  | "May 2025"
  | "October 2025"
  | "January 2026"
  | "May 2026"
  | "October 2026";

// Subject Category
export type SubjectCategory = 
  | "Chemistry" 
  | "Physics" 
  | "Mathematics" 
  | "Further Mathematics"
  | "Biology"
  | "Economics"
  | "Business Studies"
  | "Accounting"
  | "Law"
  | "Psychology";

// Subject Level
export type SubjectLevel = "AS" | "A2";

// Target Grade
export type TargetGrade = "A*" | "A" | "B" | "C" | "D" | "E";

// Study Time Preference
export type StudyTime = "morning" | "afternoon" | "evening" | "night";

// Subject Interfaces
export interface Subject {
  code: string;
  name: string;
  type: SubjectLevel;
  category: SubjectCategory;
  units: {
    id: string;
    name: string;
    description: string;
  }[];
}

// Unit Configuration
export interface UnitConfig {
  unitCode: string;
  planned: boolean;
  completed: boolean;
  targetGrade: TargetGrade;
  examSession: ExamSession;
  actualGrade?: string;
}

// User Subject Configuration
export interface UserSubjectConfig {
  subjectCode: string;
  level: SubjectLevel;
  overallTarget: TargetGrade;
  units: UnitConfig[];
}

// Study Preferences
export interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: StudyTime;
  notifications?: boolean;
}

// Basic Information Step Data
export interface BasicInfoData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Complete Registration Data
export interface RegistrationData {
  basicInfo: BasicInfoData;
  subjects: UserSubjectConfig[];
  studyPreferences?: StudyPreferences;
  currentSession?: ExamSession;
}

// Step-specific Error Types
export interface RegistrationErrors {
  basicInfo?: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  subjects?: string;
  studyPreferences?: {
    dailyStudyHours?: string;
    preferredStudyTime?: string;
  };
}
