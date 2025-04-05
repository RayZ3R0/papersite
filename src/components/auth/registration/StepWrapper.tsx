import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface StepWrapperProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function StepWrapper({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canProceed,
  children,
  title,
  subtitle,
}: StepWrapperProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 w-full bg-border dark:bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="mt-2 text-sm text-text-muted">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-text">{title}</h2>
        {subtitle && (
          <p className="text-text-muted">{subtitle}</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors
            ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed text-text-muted'
                : 'text-text hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
            }
          `}
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors
            ${
              canProceed
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-border dark:bg-border cursor-not-allowed text-text-muted'
            }
          `}
        >
          {currentStep === totalSteps - 1 ? (
            'Complete'
          ) : (
            <>
              Next
              <FiArrowRight className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}