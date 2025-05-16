'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepWrapper } from '@/components/auth/registration/StepWrapper';
import { BasicInfoStep } from '@/components/auth/registration/BasicInfoStep';
import { EnhancedSubjectSelector } from '@/components/auth/registration/EnhancedSubjectSelector';
import { SessionSelector } from '@/components/auth/registration/SessionSelector';
import { StudyPreferencesStep } from '@/components/auth/registration/StudyPreferencesStep';
import { RegistrationData, RegistrationErrors, UserSubjectConfig, StudyPreferences, ExamSession } from '@/types/registration';

enum RegistrationStep {
  BASIC_INFO,
  SUBJECT_SELECTION,
  EXAM_SESSION,
  STUDY_PREFERENCES
}

const TOTAL_STEPS = 4;

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.BASIC_INFO);
  
  const [formData, setFormData] = useState<RegistrationData>({
    basicInfo: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    subjects: [],
    studyPreferences: undefined,
    currentSession: undefined
  });

  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateBasicInfo = () => {
    const newErrors: RegistrationErrors = {
      basicInfo: {}
    };
    let isValid = true;

    // Username validation
    if (!formData.basicInfo.username) {
      newErrors.basicInfo!.username = 'Username is required';
      isValid = false;
    } else if (formData.basicInfo.username.length < 3) {
      newErrors.basicInfo!.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.basicInfo.email) {
      newErrors.basicInfo!.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) {
      newErrors.basicInfo!.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!formData.basicInfo.password) {
      newErrors.basicInfo!.password = 'Password is required';
      isValid = false;
    } else if (formData.basicInfo.password.length < 8) {
      newErrors.basicInfo!.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.basicInfo.password !== formData.basicInfo.confirmPassword) {
      newErrors.basicInfo!.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    let canProceed = false;

    switch (currentStep) {
      case RegistrationStep.BASIC_INFO:
        canProceed = validateBasicInfo();
        break;
      default:
        // All other steps are optional
        canProceed = true;
        break;
    }

    if (canProceed) {
      if (currentStep === RegistrationStep.STUDY_PREFERENCES) {
        // Final step - submit form
        await handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError(null);

    // Clean up data before submission
    const finalData = {
      ...formData,
      // Only include subjects if any are selected
      subjects: formData.subjects.length > 0 ? formData.subjects : undefined,
      // Only include other fields if they have values
      currentSession: formData.currentSession || undefined,
      studyPreferences: formData.studyPreferences || undefined
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/auth/login?registered=true');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBasicInfo = (basicInfo: typeof formData.basicInfo) => {
    setFormData(prev => ({ ...prev, basicInfo }));
    setErrors({});
    setApiError(null);
  };

  const updateSubjects = (subjects: UserSubjectConfig[]) => {
    setFormData(prev => ({ ...prev, subjects }));
    setErrors({});
  };

  const updateSession = (session: ExamSession) => {
    setFormData(prev => ({ ...prev, currentSession: session }));
    setErrors({});
  };

  const updatePreferences = (preferences: StudyPreferences) => {
    setFormData(prev => ({ ...prev, studyPreferences: preferences }));
    setErrors({});
  };

  const getStepContent = () => {
    switch (currentStep) {
      case RegistrationStep.BASIC_INFO:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={updateBasicInfo}
            errors={errors.basicInfo || {}}
          />
        );
      case RegistrationStep.SUBJECT_SELECTION:
        return (
          <EnhancedSubjectSelector
            selectedSubjects={formData.subjects}
            onSelectionChange={updateSubjects}
            errors={errors}
          />
        );
      case RegistrationStep.EXAM_SESSION:
        return (
          <SessionSelector
            currentSession={formData.currentSession || "May 2025"}
            onChange={updateSession}
          />
        );
      case RegistrationStep.STUDY_PREFERENCES:
        return (
          <StudyPreferencesStep
            preferences={formData.studyPreferences || {}}
            onChange={updatePreferences}
            errors={errors.studyPreferences}
          />
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case RegistrationStep.BASIC_INFO:
        return {
          title: "Create Account",
          subtitle: "Enter your details to get started"
        };
      case RegistrationStep.SUBJECT_SELECTION:
        return {
          title: "Choose Your Subjects (Optional)",
          subtitle: "Select your subjects or skip to register"
        };
      case RegistrationStep.EXAM_SESSION:
        return {
          title: "Exam Session (Optional)",
          subtitle: "Choose when you plan to take exams or skip"
        };
      case RegistrationStep.STUDY_PREFERENCES:
        return {
          title: "Study Preferences (Optional)",
          subtitle: "Set your preferences or skip to complete registration"
        };
    }
  };

  const getStepButtonText = () => {
    if (currentStep === RegistrationStep.BASIC_INFO) {
      return "Next";
    }
    
    if (currentStep === RegistrationStep.STUDY_PREFERENCES) {
      return "Complete Registration";
    }

    return "Next (or Skip)";
  };

  const stepInfo = getStepTitle();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <div className="w-full py-8 lg:py-12">
        <StepWrapper
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={handleBack}
          canProceed={!isLoading}
          title={stepInfo?.title || ""}
          subtitle={stepInfo?.subtitle}
          nextButtonText={getStepButtonText()}
        >
          {getStepContent()}
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
