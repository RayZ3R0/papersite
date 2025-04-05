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
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="h-1.5 w-full bg-border/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.4,
              ease: "easeInOut"
            }}
          />
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm font-medium text-text">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="text-sm text-text-muted">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-3 text-text">{title}</h2>
        {subtitle && (
          <p className="text-lg text-text-muted max-w-md mx-auto">{subtitle}</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
          className="mb-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-10">
        <motion.button
          onClick={onBack}
          disabled={currentStep === 0}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center px-5 py-2.5 rounded-lg
            font-medium transition-all duration-200
            ${currentStep === 0
              ? 'opacity-50 cursor-not-allowed text-text-muted'
              : `text-text hover:text-primary
                 hover:bg-primary/5 active:bg-primary/10
                 focus:outline-none focus:ring-2 focus:ring-primary/30`
            }
          `}
        >
          <FiArrowLeft className="mr-2 h-5 w-5" />
          Back
        </motion.button>

        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center px-6 py-2.5 rounded-lg
            font-medium transition-all duration-200
            ${canProceed
              ? `bg-primary text-white
                 hover:bg-primary/90 active:bg-primary/95
                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
                 focus:ring-offset-surface shadow-sm`
              : 'bg-border/50 cursor-not-allowed text-text-muted'
            }
          `}
        >
          {currentStep === totalSteps - 1 ? (
            'Complete'
          ) : (
            <>
              Next
              <FiArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}