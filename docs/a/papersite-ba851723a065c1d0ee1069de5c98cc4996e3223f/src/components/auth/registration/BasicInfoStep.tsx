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

  const inputClasses = (error?: string) => `
    block w-full px-4 py-3 rounded-lg text-base
    bg-surface border-2 transition duration-200 outline-none
    placeholder:text-text-muted/60
    focus-visible:outline-none
    ${error
      ? 'border-error'
      : 'border-border hover:border-primary/50 focus:border-primary'
    }
  `;

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Username field */}
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-text"
        >
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            id="username"
            value={data.username}
            onChange={handleChange('username')}
            className={inputClasses(errors.username)}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-2 text-sm text-error font-medium">{errors.username}</p>
          )}
        </div>
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text"
        >
          Email
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            value={data.email}
            onChange={handleChange('email')}
            className={inputClasses(errors.email)}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-error font-medium">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={data.password}
            onChange={handleChange('password')}
            className={inputClasses(errors.password) + ' pr-12'}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Password strength indicator */}
        <div className="mt-3 space-y-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-300
                  ${passwordStrength >= level
                    ? getStrengthClass(passwordStrength) + ' scale-y-100'
                    : 'bg-border scale-y-75 opacity-50'
                  }
                `}
              />
            ))}
          </div>
          <p className={`text-sm ${getStrengthTextColor(passwordStrength)}`}>
            {getStrengthText(passwordStrength)}
          </p>
        </div>
        
        {errors.password && (
          <p className="mt-2 text-sm text-error font-medium">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-text"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={data.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className={inputClasses(errors.confirmPassword) + ' pr-12'}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
          >
            {showConfirmPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-error font-medium">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}

function getStrengthClass(strength: number): string {
  switch (strength) {
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-lime-500';
    case 5:
      return 'bg-green-500';
    default:
      return 'bg-border';
  }
}

function getStrengthTextColor(strength: number): string {
  switch (strength) {
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-lime-500';
    case 5:
      return 'text-green-500';
    default:
      return 'text-text-muted';
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