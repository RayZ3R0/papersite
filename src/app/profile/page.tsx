'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import LoadingProfile from '@/components/profile/LoadingProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import SubjectDashboard from '@/components/profile/SubjectDashboard';
import StudyPreferences from '@/components/profile/StudyPreferences';
import { useAuth } from '@/components/auth/AuthContext';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { data, isLoading, error } = useProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!authUser) {
    return null; // ProtectedContent in layout will handle this
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">
          {error.message || 'Failed to load profile'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return <LoadingProfile />;
  }

  const { user, subjects, studyPreferences } = data;

  const handleError = (error: Error) => {
    setErrorMessage(error.message);
    // Auto-hide error after 5 seconds
    setTimeout(() => setErrorMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Profile Stats */}
      <ProfileStats 
        subjects={subjects} 
        studyPreferences={studyPreferences} 
      />

      {/* Subject Dashboard */}
      <div className="mt-8">
        <SubjectDashboard subjects={subjects} />
      </div>

      {/* Study Preferences */}
      <div className="mt-8">
        <StudyPreferences 
          preferences={studyPreferences}
          onError={handleError}
        />
      </div>
    </div>
  );
}