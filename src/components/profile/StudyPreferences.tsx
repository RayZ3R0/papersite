'use client';

import { useState } from 'react';
import { StudyPreferences as StudyPrefsType } from '@/hooks/useProfile';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';

const STUDY_TIMES = ['morning', 'afternoon', 'evening', 'night'] as const;
const HOURS_OPTIONS = Array.from({ length: 13 }, (_, i) => i); // 0-12 hours

interface StudyPreferencesProps {
  preferences: StudyPrefsType;
  onError?: (error: Error) => void;
}

export default function StudyPreferences({ preferences, onError }: StudyPreferencesProps) {
  const { updateStudyPreferences, isUpdating } = useProfileUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrefs, setEditedPrefs] = useState(preferences);

  const handleSave = async () => {
    try {
      await updateStudyPreferences(editedPrefs);
      setIsEditing(false);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to update preferences'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with edit toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Study Preferences</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-text-muted hover:text-text"
          disabled={isUpdating}
        >
          {isEditing ? (
            <span className="text-sm">Cancel</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
            </svg>
          )}
        </button>
      </div>

      {/* Preferences Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Study Hours */}
        <div className="p-4 bg-surface rounded-lg">
          <h3 className="text-sm text-text-muted mb-2">Daily Study Goal</h3>
          {isEditing ? (
            <select
              value={editedPrefs.dailyStudyHours || 0}
              onChange={(e) => setEditedPrefs({
                ...editedPrefs,
                dailyStudyHours: Number(e.target.value)
              })}
              className="w-full p-2 bg-background border rounded-lg text-text"
              disabled={isUpdating}
            >
              {HOURS_OPTIONS.map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hour{hours !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          ) : (
            <p className="font-semibold">
              {preferences.dailyStudyHours || 0} hour{preferences.dailyStudyHours !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Preferred Study Time */}
        <div className="p-4 bg-surface rounded-lg">
          <h3 className="text-sm text-text-muted mb-2">Preferred Study Time</h3>
          {isEditing ? (
            <select
              value={editedPrefs.preferredStudyTime || 'morning'}
              onChange={(e) => setEditedPrefs({
                ...editedPrefs,
                preferredStudyTime: e.target.value as typeof STUDY_TIMES[number]
              })}
              className="w-full p-2 bg-background border rounded-lg text-text"
              disabled={isUpdating}
            >
              {STUDY_TIMES.map((time) => (
                <option key={time} value={time} className="capitalize">
                  {time}
                </option>
              ))}
            </select>
          ) : (
            <p className="font-semibold capitalize">
              {preferences.preferredStudyTime || 'Not set'}
            </p>
          )}
        </div>

        {/* Notifications Toggle */}
        <div className="p-4 bg-surface rounded-lg md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-text-muted mb-1">Study Reminders</h3>
              <p className="text-sm text-text-muted">
                Get notified when it's time to study
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={editedPrefs.notifications}
                onChange={(e) => {
                  const newPrefs = {
                    ...editedPrefs,
                    notifications: e.target.checked
                  };
                  setEditedPrefs(newPrefs);
                  if (!isEditing) {
                    updateStudyPreferences(newPrefs).catch(error => {
                      onError?.(error instanceof Error ? error : new Error('Failed to update notifications'));
                    });
                  }
                }}
                disabled={isUpdating}
              />
              <div className="w-11 h-6 bg-surface-alt peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-alt after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              setEditedPrefs(preferences);
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-surface text-text rounded-lg hover:bg-surface/90"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}