"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import LoadingProfile from "@/components/profile/LoadingProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import SubjectDashboard from "@/components/profile/SubjectDashboard";
import StudyPreferences from "@/components/profile/StudyPreferences";
import { useAuth } from "@/components/auth/AuthContext";
import { UserSubjectConfig as ProfileUserSubjectConfig } from "@/types/profile";
import { useReturnTo } from "@/hooks/useReturnTo";
import ProtectedContent from "@/components/auth/ProtectedContent";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { data, isLoading, error } = useProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { saveCurrentPath } = useReturnTo();
  const currentPath = saveCurrentPath();

  // Debug logs
  useEffect(() => {
    console.log('Profile page mounted/updated:', {
      hasAuth: !!authUser,
      hasData: !!data,
      isLoading,
      hasError: !!error,
      path: currentPath
    });

    if (data) {
      // console.log('Profile data available:', {
      //   username: data.user?.username,
      //   subjects: data.subjects?.length || 0,
      //   hasPreferences: !!data.studyPreferences
      // });
    }
  }, [authUser, data, isLoading, error, currentPath]);

  const handleError = (error: Error) => {
    console.error('Profile component error:', error);
    setErrorMessage(error.message);
    // Auto-hide error after 5 seconds
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const profileContent = (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Show error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            {error.message || "Failed to load profile"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Show loading state */}
      {isLoading ? (
        <LoadingProfile />
      ) : !data || !data.user ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">No profile data available</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          {data.user && <ProfileHeader user={data.user} />}

          {/* Profile Stats */}
          {data.subjects && data.studyPreferences && (
            <ProfileStats
              subjects={data.subjects as unknown as ProfileUserSubjectConfig[]}
              studyPreferences={data.studyPreferences}
            />
          )}

          {/* Subject Dashboard */}
          {data.subjects && (
            <div className="mt-8">
              <SubjectDashboard
                subjects={data.subjects as unknown as ProfileUserSubjectConfig[]}
              />
            </div>
          )}

          {/* Study Preferences */}
          {data.studyPreferences && (
            <div className="mt-8">
              <StudyPreferences
                preferences={data.studyPreferences}
                onError={handleError}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <ProtectedContent
      roles={["user", "moderator", "admin"]}
      message="Please sign in to view your profile"
      customReturnTo={currentPath}
    >
      {profileContent}
    </ProtectedContent>
  );
}
