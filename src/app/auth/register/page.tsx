'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepWrapper } from '@/components/auth/registration/StepWrapper';
import { BasicInfoStep } from '@/components/auth/registration/BasicInfoStep';

interface BasicInfoData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegistrationData {
  basicInfo: BasicInfoData;
}

interface RegistrationErrors {
  basicInfo: Partial<Record<keyof BasicInfoData, string>>;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationData>({
    basicInfo: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [errors, setErrors] = useState<RegistrationErrors>({
    basicInfo: {},
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateBasicInfo = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Username validation
    if (!formData.basicInfo.username) {
      newErrors.basicInfo.username = 'Username is required';
      isValid = false;
    } else if (formData.basicInfo.username.length < 3) {
      newErrors.basicInfo.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.basicInfo.email) {
      newErrors.basicInfo.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) {
      newErrors.basicInfo.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!formData.basicInfo.password) {
      newErrors.basicInfo.password = 'Password is required';
      isValid = false;
    } else if (formData.basicInfo.password.length < 8) {
      newErrors.basicInfo.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.basicInfo.password !== formData.basicInfo.confirmPassword) {
      newErrors.basicInfo.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (validateBasicInfo()) {
      setIsLoading(true);
      setApiError(null);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.basicInfo.username,
            email: formData.basicInfo.email,
            password: formData.basicInfo.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Redirect to login with success message
        router.push('/auth/login?registered=true');
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateBasicInfo = (data: BasicInfoData) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: data
    }));
    // Clear errors as user types
    setErrors(prev => ({
      ...prev,
      basicInfo: {}
    }));
    // Clear API error when user makes changes
    setApiError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-surface dark:bg-surface-dark">
      <div className="w-full">
        <StepWrapper
          currentStep={0}
          totalSteps={1}
          onNext={handleNext}
          onBack={() => {}}
          canProceed={!isLoading}
          title="Create Account"
          subtitle="Enter your details to get started"
        >
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={updateBasicInfo}
            errors={errors.basicInfo}
          />
        </StepWrapper>

        {/* API Error Display */}
        {apiError && (
          <div className="max-w-2xl mx-auto mt-4 p-3 bg-error/10 border border-error rounded text-error text-sm">
            {apiError}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-2xl mx-auto mt-4 text-center text-text-muted">
            Creating your account...
          </div>
        )}
      </div>
    </div>
  );
}