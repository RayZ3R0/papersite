'use client';

import React from 'react';

interface SubjectSelectorProps {
  selectedSubjects: string[];
  onChange: (subjects: string[]) => void;
  disabled?: boolean;
  error?: string;
}

const AVAILABLE_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Further Mathematics',
  'Statistics'
];

export default function SubjectSelector({
  selectedSubjects,
  onChange,
  disabled = false,
  error
}: SubjectSelectorProps) {
  const handleSubjectToggle = (subject: string) => {
    if (disabled) return;
    
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    
    onChange(newSubjects);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text">
        Subjects
      </label>
      
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {AVAILABLE_SUBJECTS.map(subject => (
          <label
            key={subject}
            className={`
              relative flex items-center p-4 rounded-lg border
              ${disabled 
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:bg-surface-alt'
              }
              ${selectedSubjects.includes(subject)
                ? 'border-primary bg-primary/5'
                : 'border-divider'
              }
            `}
          >
            <input
              type="checkbox"
              name="subjects"
              value={subject}
              checked={selectedSubjects.includes(subject)}
              onChange={() => handleSubjectToggle(subject)}
              disabled={disabled}
              className="h-4 w-4 text-primary border-divider rounded focus:ring-primary"
            />
            <span className="ml-3 text-sm text-text">{subject}</span>
          </label>
        ))}
      </div>

      <p className="text-sm text-text-muted">
        Select all subjects that you are interested in studying.
      </p>
    </div>
  );
}