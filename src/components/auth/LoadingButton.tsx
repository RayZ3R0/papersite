'use client';

import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function LoadingButton({
  loading = false,
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  // Base styles
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors relative";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-surface text-text hover:bg-surface-alt",
    outline: "border border-border text-text hover:bg-surface",
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="opacity-0">{children}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
}