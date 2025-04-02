'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import LoadingButton from '@/components/auth/LoadingButton';

export default function RegisterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Registration error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-error mx-auto" />
        
        <h2 className="mt-4 text-lg font-semibold text-text">
          Registration Error
        </h2>
        
        <p className="mt-2 text-text-muted">
          We encountered an error while trying to create your account. 
          Please try again.
        </p>

        <div className="mt-6">
          <LoadingButton
            onClick={reset}
            variant="primary"
          >
            Try again
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}