import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface BasicInfoFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface BasicInfoStepProps {
  data: BasicInfoFormData;
  onChange: (data: BasicInfoFormData) => void;
  errors: Partial<Record<keyof BasicInfoFormData, string>>;
}

export function BasicInfoStep({ data, onChange, errors }: BasicInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: keyof BasicInfoFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(data.password);

  return (
    <div className="space-y-6">
      {/* Username field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-text dark:text-text"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          value={data.username}
          onChange={handleChange('username')}
          className={`mt-1 block w-full rounded-md border bg-surface dark:bg-surface-dark
            focus:border-primary focus:ring-primary
            ${errors.username ? 'border-error' : 'border-border'}`}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-error">{errors.username}</p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text dark:text-text"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={data.email}
          onChange={handleChange('email')}
          className={`mt-1 block w-full rounded-md border bg-surface dark:bg-surface-dark
            focus:border-primary focus:ring-primary
            ${errors.email ? 'border-error' : 'border-border'}`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text dark:text-text"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={data.password}
            onChange={handleChange('password')}
            className={`mt-1 block w-full rounded-md border bg-surface dark:bg-surface-dark
              focus:border-primary focus:ring-primary
              ${errors.password ? 'border-error' : 'border-border'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Password strength indicator */}
        <div className="mt-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 w-full rounded transition-colors ${
                  passwordStrength >= level
                    ? getStrengthClass(passwordStrength)
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {getStrengthText(passwordStrength)}
          </p>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-error">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-text dark:text-text"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={data.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className={`mt-1 block w-full rounded-md border bg-surface dark:bg-surface-dark
              focus:border-primary focus:ring-primary
              ${errors.confirmPassword ? 'border-error' : 'border-border'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted"
          >
            {showConfirmPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}

function getStrengthClass(strength: number): string {
  switch (strength) {
    case 1:
      return 'bg-error';
    case 2:
      return 'bg-warning';
    case 3:
      return 'bg-info';
    case 4:
      return 'bg-success';
    case 5:
      return 'bg-success-dark';
    default:
      return 'bg-border';
  }
}

function getStrengthText(strength: number): string {
  switch (strength) {
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Fair';
    case 4:
      return 'Strong';
    case 5:
      return 'Very Strong';
    default:
      return 'Enter password';
  }
}