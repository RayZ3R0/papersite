'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

type RegistrationStep = 'basicInfo' | 'academicInfo' | 'preferences';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  subjects: string[];
  session: string;
  institution: string;
  studyGoals: string;
  notifications: boolean;
  studyReminders: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, isLoading, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basicInfo');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    subjects: [],
    session: '',
    institution: '',
    studyGoals: '',
    notifications: true,
    studyReminders: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const validateCurrentStep = (): boolean => {
    clearError();
    
    switch (currentStep) {
      case 'basicInfo':
        if (!formData.username || !formData.email || !formData.password) {
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          return false;
        }
        if (formData.password.length < 8) {
          return false;
        }
        return true;

      case 'academicInfo':
        if (formData.subjects.length === 0 || !formData.session) {
          return false;
        }
        return true;

      case 'preferences':
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    switch (currentStep) {
      case 'basicInfo':
        setCurrentStep('academicInfo');
        break;
      case 'academicInfo':
        setCurrentStep('preferences');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'academicInfo':
        setCurrentStep('basicInfo');
        break;
      case 'preferences':
        setCurrentStep('academicInfo');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    try {
      await register(formData.username, formData.password, formData.email);
      // TODO: Save additional user data (subjects, preferences, etc.)
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={formData.username}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Choose a username"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Create a password"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Confirm your password"
        />
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Subjects
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(subject => (
            <label
              key={subject}
              className="inline-flex items-center p-3 border border-divider rounded-lg cursor-pointer hover:bg-surface-alt"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-primary border-divider rounded focus:ring-primary"
                checked={formData.subjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
              />
              <span className="ml-2">{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="session" className="block text-sm font-medium text-text">
          Session/Year
        </label>
        <select
          id="session"
          name="session"
          value={formData.session}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Select Session</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
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
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Enter your institution"
        />
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-text">
          Notification Preferences
        </label>
        <div className="space-y-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-divider rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-text">
              Receive forum notifications
            </span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="studyReminders"
              checked={formData.studyReminders}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-divider rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-text">
              Enable study reminders
            </span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="studyGoals" className="block text-sm font-medium text-text">
          Study Goals
        </label>
        <textarea
          id="studyGoals"
          name="studyGoals"
          rows={3}
          value={formData.studyGoals}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-surface-alt border border-divider rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="What are your study goals?"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text text-center">Create your account</h1>
        <div className="flex justify-center space-x-4">
          {(['basicInfo', 'academicInfo', 'preferences'] as const).map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${index > 0 ? 'ml-4' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step
                    ? 'bg-primary text-white'
                    : 'bg-surface-alt text-text-muted'
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div className="w-8 h-0.5 bg-divider mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={currentStep === 'preferences' ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {currentStep === 'basicInfo' && renderBasicInfo()}
        {currentStep === 'academicInfo' && renderAcademicInfo()}
        {currentStep === 'preferences' && renderPreferences()}

        <div className="flex justify-between space-x-4">
          {currentStep !== 'basicInfo' && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-2 px-4 border border-divider rounded-md shadow-sm text-sm font-medium text-text hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Back
            </button>
          )}

          <button
            type={currentStep === 'preferences' ? 'submit' : 'button'}
            onClick={currentStep !== 'preferences' ? handleNext : undefined}
            disabled={isLoading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating account...
              </div>
            ) : currentStep === 'preferences' ? (
              'Create account'
            ) : (
              'Next'
            )}
          </button>
        </div>

        {currentStep === 'basicInfo' && (
          <div className="text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </form>
    </>
  );
}