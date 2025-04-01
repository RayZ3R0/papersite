'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import Image from 'next/image';
import SuccessMessage from '@/components/ui/SuccessMessage';

export default function ProfilePage() {
  const { user, updateProfile, error: authError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-surface rounded-lg shadow p-6 space-y-4">
        {successMessage && <SuccessMessage message={successMessage} />}
        {authError && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3">
            <p className="text-sm text-error">{authError}</p>
          </div>
        )}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0">
              {user.profilePicture ? (
                <Image
                  width={96}
                  height={96}
                  className="mx-auto h-24 w-24 rounded-full"
                  src={user.profilePicture}
                  alt={user.username}
                />
              ) : (
                <div className="mx-auto h-24 w-24 rounded-full bg-surface-alt flex items-center justify-center">
                  <span className="text-3xl text-text-muted">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-xl font-bold text-text sm:text-2xl">{user.username}</p>
              <p className="text-sm font-medium text-text-muted">{user.email}</p>
              <p className="text-sm text-text-muted capitalize">Role: {user.role}</p>
            </div>
          </div>
          <div className="mt-5 flex justify-center sm:mt-0">
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-divider rounded-md shadow-sm text-sm font-medium text-text bg-surface hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5 text-text-muted"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-surface rounded-lg shadow divide-y divide-divider">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-text">Profile Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            Personal details and application settings.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Username</dt>
              <dd className="mt-1 text-sm text-text">{user.username}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Email</dt>
              <dd className="mt-1 text-sm text-text">{user.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Joined</dt>
              <dd className="mt-1 text-sm text-text">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Last Login</dt>
              <dd className="mt-1 text-sm text-text">
                {user.lastLogin 
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : 'Never'
                }
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-text-muted">Study Goals</dt>
              <dd className="mt-1 text-sm text-text">
                {user.studyGoals || 'No study goals set'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Subject Interests */}
      <div className="bg-surface rounded-lg shadow divide-y divide-divider">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-text">Academic Interests</h3>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            Your selected subjects and study preferences.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-text-muted">Subjects</dt>
              <dd className="mt-1 text-sm text-text">
                <div className="flex flex-wrap gap-2">
                  {user.subjects && user.subjects.length > 0 ? (
                    user.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary"
                      >
                        {subject}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-muted">No subjects selected</span>
                  )}
                </div>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Session</dt>
              <dd className="mt-1 text-sm text-text">
                {user.session || 'Not specified'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Institution</dt>
              <dd className="mt-1 text-sm text-text">
                {user.institution || 'Not specified'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-surface rounded-lg shadow divide-y divide-divider">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-text">Preferences</h3>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            Your notification and study reminder settings.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Forum Notifications</dt>
              <dd className="mt-1 text-sm text-text">
                {user.notifications ? 'Enabled' : 'Disabled'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-text-muted">Study Reminders</dt>
              <dd className="mt-1 text-sm text-text">
                {user.studyReminders ? 'Enabled' : 'Disabled'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}