'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const registered = searchParams?.get('registered');
    if (registered) {
      setSuccessMessage('Account created successfully! Please log in.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-surface dark:bg-surface-dark">
      <div className="max-w-md w-full space-y-8">
        {/* Success message */}
        {successMessage && (
          <div className="p-3 bg-success/10 border border-success rounded text-success text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}