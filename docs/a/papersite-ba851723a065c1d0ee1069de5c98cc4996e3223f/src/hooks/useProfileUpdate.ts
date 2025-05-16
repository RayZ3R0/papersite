'use client';

import { useState } from 'react';
import { useProfile, ProfileData } from './useProfile';

interface UpdateOptions {
  // If true, will update the local state before the server response
  optimistic?: boolean;
}

export function useProfileUpdate() {
  const { data, refetch } = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = async (
    updates: Partial<Omit<ProfileData, 'user'>>,
    options: UpdateOptions = { optimistic: true }
  ) => {
    try {
      setError(null);
      setIsUpdating(true);

      // Create updated profile data
      const updatedData = {
        ...data,
        ...updates
      };

      // If optimistic updates are enabled, update local state immediately
      if (options.optimistic) {
        refetch();
      }

      // Send update to server
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Refetch to ensure we have the latest data
      await refetch();

      return await response.json();
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      
      // If optimistic update was used, refetch to revert changes
      if (options.optimistic) {
        await refetch();
      }
      
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStudyPreferences = async (
    preferences: Partial<ProfileData['studyPreferences']>
  ) => {
    return updateProfile({
      studyPreferences: {
        ...data?.studyPreferences,
        ...preferences
      }
    });
  };

  const updateSubjects = async (
    subjects: ProfileData['subjects']
  ) => {
    return updateProfile({ subjects });
  };

  return {
    isUpdating,
    error,
    updateProfile,
    updateStudyPreferences,
    updateSubjects
  };
}

export type UseProfileUpdateReturn = ReturnType<typeof useProfileUpdate>;