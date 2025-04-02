'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import FormInput from '@/components/auth/FormInput';
import FormError from '@/components/auth/FormError';
import LoadingButton from '@/components/auth/LoadingButton';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      const returnTo = searchParams.get('returnTo') || '/';
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text">Welcome back</h1>
          <p className="text-text-muted mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormError error={error} className="mb-6" />

          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />

          <FormInput
            label="Password"
            type="password"
            showPasswordToggle
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
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