'use client';

import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  error?: string | null;
  className?: string;
}

export default function FormError({ error, className = '' }: FormErrorProps) {
  if (!error) return null;

  return (
    <div
      className={`
        flex items-center gap-2 text-sm text-error
        ${className}
      `}
    >
      <AlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );
}