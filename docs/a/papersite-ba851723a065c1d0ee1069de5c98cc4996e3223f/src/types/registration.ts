import { UserRole } from '@/lib/authTypes';
import { ExamSession } from '@/lib/data/subjects';
import { UserSubjectConfig } from './profile';

export interface BasicRegistrationInfo {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  notifications?: boolean;
}

export interface RegistrationData {
  basicInfo: BasicRegistrationInfo;
  subjects?: UserSubjectConfig[];
  studyPreferences?: StudyPreferences;
  currentSession?: ExamSession;
}

export interface RegisterData extends BasicRegistrationInfo {
  subjects?: UserSubjectConfig[];
  studyPreferences?: StudyPreferences;
  currentSession?: ExamSession;
}

// MongoDB error types
export interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

export interface ValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}
