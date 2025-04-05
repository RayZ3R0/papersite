'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import FormInput from './FormInput';
import FormError from './FormError';
import LoadingButton from './LoadingButton';

interface LoginFormProps {
  onSuccess?: () => void;
  returnTo?: string;
}

export default function LoginForm({ onSuccess, returnTo }: LoginFormProps) {
  const router = useRouter();
  const { login, error, isLoading, clearError, user } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });

  // Clear error on unmount or when form data changes
  useEffect(() => {
    return () => clearError();
  }, [formData, clearError]);

  // Handle redirect after successful login
  useEffect(() => {
    if (user) {
      // Check if trying to access admin page
      if (returnTo?.startsWith('/admin')) {
        if (user.role === 'admin') {
          router.push(returnTo);
        } else {
          router.push('/'); // Non-admin users get redirected to home
        }
      } else if (onSuccess) {
        onSuccess();
      } else if (returnTo) {
        router.push(returnTo);
      }
    }
  }, [user, returnTo, onSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.identifier, formData.password, formData.rememberMe);
      // Redirect is handled by the useEffect above
    } catch {
      // Error is handled by AuthContext
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <FormError error={error} className="mb-6" />}

      <FormInput
        id="login-identifier"
        label="Email or Username"
        type="text"
        value={formData.identifier}
        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
        required
        autoComplete="username"
        disabled={isLoading}
        placeholder="Enter your email or username"
      />

      <FormInput
        id="login-password"
        label="Password"
        type="password"
        showPasswordToggle
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        autoComplete="current-password"
        disabled={isLoading}
        placeholder="Enter your password"
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember-me"
          checked={formData.rememberMe}
          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted">
          Remember me
        </label>
      </div>

      <LoadingButton
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Sign in
      </LoadingButton>
    </form>
  );
}