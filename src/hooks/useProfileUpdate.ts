import { useState, useEffect, useCallback } from 'react';
import { UserProfile, UserSubjectConfig } from '@/types/profile';
import { AuthError } from '@/lib/authTypes';

interface UseProfileUpdateOptions {
  onSuccess?: (data: UserProfile) => void;
  onError?: (error: Error) => void;
  debounceMs?: number;
}

interface UpdateState {
  loading: boolean;
  error: Error | null;
  data: UserProfile | null;
  lastSaved: Date | null;
}

type ProfileUpdate = {
  subjects?: UserSubjectConfig[];
  studyPreferences?: {
    dailyStudyHours?: number;
    preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    notifications?: boolean;
  };
};

/**
 * Hook for managing profile updates with security and error handling
 */
export function useProfileUpdate(options: UseProfileUpdateOptions = {}) {
  const [state, setState] = useState<UpdateState>({
    loading: false,
    error: null,
    data: null,
    lastSaved: null
  });

  const [pendingUpdates, setPendingUpdates] = useState<ProfileUpdate>({});
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  /**
   * Send profile update request
   */
  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection
        },
        body: JSON.stringify(updates),
        credentials: 'include' // Include cookies
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Check for rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new AuthError('RATE_LIMIT', data.error, retryAfter ? parseInt(retryAfter) : undefined);
        }

        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        loading: false,
        data: data.profile,
        lastSaved: new Date(),
        error: null
      }));

      options.onSuccess?.(data.profile);

    } catch (error) {
      console.error('Profile update error:', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        lastSaved: null
      }));

      options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [options]);

  /**
   * Queue profile update with debouncing
   */
  const queueUpdate = useCallback((updates: ProfileUpdate) => {
    // Clear any pending timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // Merge new updates with pending updates
    setPendingUpdates(prev => ({
      subjects: updates.subjects || prev.subjects,
      studyPreferences: updates.studyPreferences ? {
        ...prev.studyPreferences,
        ...updates.studyPreferences
      } : prev.studyPreferences
    }));

    // Set new timeout
    const timeout = setTimeout(() => {
      updateProfile(pendingUpdates);
      setPendingUpdates({});
    }, options.debounceMs || 1000);

    setUpdateTimeout(timeout);
  }, [updateTimeout, pendingUpdates, options.debounceMs, updateProfile]);

  /**
   * Force immediate update
   */
  const saveNow = useCallback(async () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      setUpdateTimeout(undefined);
    }

    if (Object.keys(pendingUpdates).length > 0) {
      await updateProfile(pendingUpdates);
      setPendingUpdates({});
    }
  }, [updateTimeout, pendingUpdates, updateProfile]);

  return {
    update: queueUpdate,
    saveNow,
    loading: state.loading,
    error: state.error,
    data: state.data,
    lastSaved: state.lastSaved,
    hasPendingChanges: Object.keys(pendingUpdates).length > 0
  };
}