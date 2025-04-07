'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { UserWithoutPassword } from '@/lib/authTypes';
// Import types from profile.ts instead of defining them here
import { UserSubjectConfig, ExamSession } from '@/types/profile';

// Only define types that aren't already defined in profile.ts
export interface StudyPreferences {
  dailyStudyHours?: number;
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  notifications?: boolean;
}

export interface ProfileData {
  user: UserWithoutPassword;
  subjects: UserSubjectConfig[];
  studyPreferences: StudyPreferences;
}

export interface UseProfileReturn {
  data: ProfileData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only fetch if we have an authenticated user
      if (!authUser) {
        setData(null);
        return;
      }

      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const profileData = await response.json();
      setData(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data when auth user changes
  useEffect(() => {
    fetchProfile();
  }, [authUser]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}