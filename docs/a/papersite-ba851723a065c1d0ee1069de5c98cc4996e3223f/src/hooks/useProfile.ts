'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { UserWithoutPassword } from '@/lib/authTypes';
import { UserSubjectConfig } from '@/types/profile';

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

  const fetchProfile = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n==== Fetching Profile ====');
        console.log('Auth state:', {
          hasAuth: !!authUser,
          userId: authUser?._id
        });
      }
      
      setIsLoading(true);
      setError(null);

      // Only fetch if we have an authenticated user
      if (!authUser) {
        // console.log('No auth user, skipping fetch');
        setData(null);
        return;
      }

      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        if (response.status === 404) {
          setData(null);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const result = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', {
          success: result.success,
          hasUser: !!result.user,
          hasSubjects: !!result.subjects,
          subjectCount: result.subjects?.length,
          subjects: result.subjects?.map((s: any) => ({
            code: s.subjectCode,
            unitCount: s.units?.length,
            units: s.units?.map((u: any) => u.unitCode)
          }))
        });
      }

      if (!result) {
        throw new Error('Empty response from API');
      }

      if (result.success) {
        // Validate user data
        if (!result.user) {
          console.error('Missing user data in response');
          throw new Error('Missing user data in response');
        }

        if (!result.user.username || !result.user._id) {
          console.error('Invalid user data:', result.user);
          throw new Error('Invalid user data structure');
        }

        // Validate and transform data
        const profileData = {
          user: {
            ...result.user,
            _id: String(result.user._id), // Ensure _id is string
            createdAt: result.user.createdAt || new Date().toISOString(),
            lastLogin: result.user.lastLogin || new Date().toISOString()
          },
          subjects: Array.isArray(result.subjects) ? result.subjects : [],
          studyPreferences: {
            dailyStudyHours: result.studyPreferences?.dailyStudyHours || 0,
            preferredStudyTime: result.studyPreferences?.preferredStudyTime || 'morning',
            notifications: result.studyPreferences?.notifications ?? true
          }
        };

        // console.log('Processed profile data:', JSON.stringify(profileData, null, 2));
        setData(profileData);
      } else {
        console.error('API error response:', result);
        throw new Error(result.error || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch profile'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]); // authUser is the only external dependency

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile hook effect:', {
        hasAuth: !!authUser,
        path: window?.location?.pathname
      });
    }
    
    if (authUser) {
      fetchProfile();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [authUser, fetchProfile]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}