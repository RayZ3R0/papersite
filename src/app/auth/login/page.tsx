'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import FormInput from '@/components/auth/FormInput';
import FormError from '@/components/auth/FormError';
import LoadingButton from '@/components/auth/LoadingButton';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  validateLoginForm, 
  LoginFormData, 
  ValidationResult,
  getErrorMessage 
} from '@/lib/auth/login-validation';

type FieldNames = 'identifier' | 'password' | 'rememberMe';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState<ValidationResult['errors']>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFormErrors({});

    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      await login(
        formData.identifier,
        formData.password,
        formData.rememberMe
      );

      const returnTo = searchParams.get('returnTo') || '/';
      router.push(returnTo);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, router, searchParams]);

  const handleFieldChange = useCallback((field: FieldNames, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    if (field === 'identifier') {
      setFormErrors(prev => {
        const { identifier, ...rest } = prev;
        return rest;
      });
    } else if (field === 'password') {
      setFormErrors(prev => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-theme(space.32))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text">Welcome back</h1>
          <p className="text-text-muted mt-2">
            Sign in to access your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormError error={submitError} className="mb-6" />

          <FormInput
            label="Email or Username"
            type="text"
            value={formData.identifier}
            onChange={(e) => handleFieldChange('identifier', e.target.value)}
            error={formErrors.identifier}
            required
            autoComplete="username"
            disabled={isSubmitting}
            placeholder="Enter your email or username"
          />

          <FormInput
            label="Password"
            type="password"
            showPasswordToggle
            value={formData.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            error={formErrors.password}
            required
            autoComplete="current-password"
            disabled={isSubmitting}
            placeholder="Enter your password"
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleFieldChange('rememberMe', e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-text-muted">Remember me</span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/90"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="w-full"
          >
            Sign in
          </LoadingButton>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link
            href={`/auth/register${searchParams.get('returnTo') ? `?returnTo=${searchParams.get('returnTo')}` : ''}`}
            className="text-primary hover:text-primary/90"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}