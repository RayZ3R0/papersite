'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import FormInput from './FormInput';
import FormError from './FormError';
import LoadingButton from './LoadingButton';

interface RegisterFormProps {
  onSuccess?: () => void;
  returnTo?: string;
}

export default function RegisterForm({ onSuccess, returnTo }: RegisterFormProps) {
  const { register, error, isLoading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Clear error on unmount or when form data changes
  useEffect(() => {
    return () => clearError();
  }, [formData, clearError]);

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      onSuccess?.();
    } catch {
      // Error is handled by AuthContext
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
    clearError();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <FormError error={error} className="mb-6" />}

      <FormInput
        label="Username"
        type="text"
        value={formData.username}
        onChange={(e) => handleFieldChange('username', e.target.value)}
        error={formErrors.username}
        required
        autoComplete="username"
        disabled={isLoading}
        placeholder="Choose a username"
      />

      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleFieldChange('email', e.target.value)}
        error={formErrors.email}
        required
        autoComplete="email"
        disabled={isLoading}
        placeholder="Enter your email"
      />

      <FormInput
        label="Password"
        type="password"
        showPasswordToggle
        value={formData.password}
        onChange={(e) => handleFieldChange('password', e.target.value)}
        error={formErrors.password}
        required
        autoComplete="new-password"
        disabled={isLoading}
        placeholder="Create a password"
      />

      <FormInput
        label="Confirm Password"
        type="password"
        showPasswordToggle
        value={formData.confirmPassword}
        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
        error={formErrors.confirmPassword}
        required
        autoComplete="new-password"
        disabled={isLoading}
        placeholder="Confirm your password"
      />

      <LoadingButton
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Create Account
      </LoadingButton>
    </form>
  );
}