import { UserSubject, StudyPreferences } from './registration';
import { UserRole } from './authTypes';

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  subjects?: UserSubject[];
  studyPreferences?: StudyPreferences;
  lastLogin?: string;
  loginCount?: number;
}

export interface ProfileStats {
  totalSubjects: number;
  completedUnits: number;
  studyStreak: number;
  avgStudyTime?: number;
}