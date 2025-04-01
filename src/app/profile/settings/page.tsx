'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import SuccessMessage from '@/components/ui/SuccessMessage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SettingsPage() {
  const { user, updateProfile, updatePassword, error: authError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [formData, setFormData] = useState({
    notifications: user?.notifications ?? true,
    studyReminders: user?.studyReminders ?? true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setPasswordSuccessMessage(null);

    try {
      await updateProfile({
        notifications: formData.notifications,
        studyReminders: formData.studyReminders
      });
      setIsEditing(false);
      setSuccessMessage('Preferences updated successfully');
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  const validatePasswordForm = () => {
    setLocalError(null);
    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError('New passwords do not match');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmPasswordChange = async () => {
    try {
      setLocalError(null);
      setSuccessMessage(null);
      
      await updatePassword(formData.currentPassword, formData.newPassword);
      
      // Clear password fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setPasswordSuccessMessage('Password updated successfully');
    } catch (err) {
      console.error('Failed to update password:', err);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You'll need to use the new password for future logins."
        confirmText="Change Password"
        onConfirm={handleConfirmPasswordChange}
        onCancel={() => setShowConfirmDialog(false)}
      />

      {/* Notification Preferences Form */}
      <form onSubmit={handlePreferencesSubmit} className="bg-surface rounded-lg shadow divide-y divide-divider">
        {successMessage && (
          <div className="px-4 py-3">
            <SuccessMessage message={successMessage} />
          </div>
        )}
        {(authError || localError) && (
          <div className="px-4 py-3 bg-error/10 border-b border-error/20">
            <p className="text-sm text-error">{authError || localError}</p>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="notifications"
                  name="notifications"
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-primary border-divider rounded focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="notifications" className="font-medium text-text">
                  Forum Notifications
                </label>
                <p className="text-text-muted">
                  Receive notifications for replies and mentions in forum discussions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="studyReminders"
                  name="studyReminders"
                  type="checkbox"
                  checked={formData.studyReminders}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-primary border-divider rounded focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="studyReminders" className="font-medium text-text">
                  Study Reminders
                </label>
                <p className="text-text-muted">
                  Get reminders about your study schedule and goals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="px-4 py-3 bg-surface-alt text-right sm:px-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save Preferences
            </button>
          </div>
        )}
      </form>

      {/* Change Password Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-surface rounded-lg shadow divide-y divide-divider">
        {passwordSuccessMessage && (
          <div className="px-4 py-3">
            <SuccessMessage message={passwordSuccessMessage} />
          </div>
        )}
        {(authError || localError) && (
          <div className="px-4 py-3 bg-error/10 border-b border-error/20">
            <p className="text-sm text-error">{authError || localError}</p>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-text">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="mt-1 block w-full border-divider rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-alt"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-text">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-1 block w-full border-divider rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-alt"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full border-divider rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface-alt"
              />
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-surface-alt text-right sm:px-6">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}