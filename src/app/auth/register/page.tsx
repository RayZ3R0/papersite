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
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <div className="w-full py-8 lg:py-12">
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
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-error/5 border-2 border-error rounded-lg">
            <p className="text-sm font-medium text-error flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {apiError}
            </p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-2xl mx-auto mt-6 flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-text-muted font-medium">Creating your account...</span>
          </div>
        )}
      </div>
    </div>
  );
}