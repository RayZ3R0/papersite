'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import FormInput from './FormInput';
import FormError from './FormError';
import LoadingButton from './LoadingButton';

interface LoginFormProps {
  onSuccess?: () => void;
  returnTo?: string;
}

export default function LoginForm({ onSuccess, returnTo }: LoginFormProps) {
  const { login, error, isLoading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });

  // Clear error on unmount or when form data changes
  useEffect(() => {
    return () => clearError();
  }, [formData, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.identifier, formData.password, formData.rememberMe);
      onSuccess?.();
    } catch {
      // Error is handled by AuthContext
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <FormError error={error} className="mb-6" />}

      <FormInput
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