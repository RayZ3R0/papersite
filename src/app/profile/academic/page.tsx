'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import SuccessMessage from '@/components/ui/SuccessMessage';
import SubjectSelector from '@/components/academic/SubjectSelector';

const SESSIONS = [
  '2024',
  '2025',
  '2026',
  '2027'
];

export default function AcademicProfilePage() {
  const { user, updateProfile, error: authError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subjects: user?.subjects || [],
    session: user?.session || '',
    institution: user?.institution || '',
    studyGoals: user?.studyGoals || ''
  });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectsChange = (subjects: string[]) => {
    setFormData(prev => ({ ...prev, subjects }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSuccessMessage(null);
      await updateProfile({
        subjects: formData.subjects,
        session: formData.session,
        institution: formData.institution,
        studyGoals: formData.studyGoals
      });
      setIsEditing(false);
      setSuccessMessage('Academic profile updated successfully');
    } catch (err) {
      // Error is handled by auth context
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow divide-y divide-divider">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-text">Academic Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-text-muted">
                Your academic interests and study preferences.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-divider rounded-md shadow-sm text-sm font-medium text-text bg-surface hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="px-4 py-3">
            <SuccessMessage message={successMessage} />
          </div>
        )}
        
        {authError && (
          <div className="px-4 py-3 bg-error/10 border-b border-error/20">
            <p className="text-sm text-error">{authError}</p>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <SubjectSelector
              selectedSubjects={formData.subjects}
              onChange={handleSubjectsChange}
              disabled={!isEditing}
            />

            <div>
              <label htmlFor="session" className="block text-sm font-medium text-text">
                Session/Year
              </label>
              <select
                id="session"
                name="session"
                value={formData.session}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-divider rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-alt"
              >
                <option value="">Select a session</option>
                {SESSIONS.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-text">
                Institution (Optional)
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 block w-full border-divider rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-alt"
                placeholder="Enter your institution"
              />
            </div>

            <div>
              <label htmlFor="studyGoals" className="block text-sm font-medium text-text">
                Study Goals
              </label>
              <textarea
                id="studyGoals"
                name="studyGoals"
                rows={4}
                value={formData.studyGoals}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 block w-full border-divider rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-alt"
                placeholder="What are your study goals?"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="px-4 py-3 bg-surface-alt text-right sm:px-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}