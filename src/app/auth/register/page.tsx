'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import FormInput from '@/components/auth/FormInput';
import FormError from '@/components/auth/FormError';
import LoadingButton from '@/components/auth/LoadingButton';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData.username, formData.email, formData.password);
      const returnTo = searchParams.get('returnTo') || '/';
      router.push(returnTo);
    } catch (error) {
      setFormErrors({
        form: error instanceof Error ? error.message : 'Registration failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = useCallback((field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined, form: undefined }));
  }, []);

  return (
    <div className="min-h-[calc(100vh-theme(space.32))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text">Create an Account</h1>
          <p className="text-text-muted mt-2">
            Join our community to access all features
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormError error={formErrors.form} className="mb-6" />

          <FormInput
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            error={formErrors.username}
            required
            autoComplete="username"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            placeholder="Confirm your password"
          />

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="w-full"
          >
            Create Account
          </LoadingButton>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link
            href={`/auth/login${searchParams.get('returnTo') ? `?returnTo=${searchParams.get('returnTo')}` : ''}`}
            className="text-primary hover:text-primary/90"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}