'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
}

export default function FormInput({
  label,
  error,
  type = 'text',
  showPasswordToggle,
  wrapperClassName = '',
  inputClassName = '',
  id,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine the effective type for password fields
  const inputType = showPasswordToggle
    ? showPassword ? 'text' : 'password'
    : type;

  // Base input classes
  const baseInputClasses = `
    w-full px-3 py-2 bg-background
    border border-border rounded-md
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
    ${error ? 'border-error' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-text"
      >
        {label}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={baseInputClasses}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text"
            tabIndex={-1} // Don't include in tab order
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}