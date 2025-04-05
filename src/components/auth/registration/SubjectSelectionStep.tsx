import React from 'react';
import { IALSubjects, Subject, Unit } from '@/lib/data/subjects';

interface SelectedSubject {
  subjectCode: string;
  level: 'AS' | 'A2';
  units: string[];
}

interface SubjectSelectionData {
  selectedSubjects: SelectedSubject[];
}

interface SubjectSelectionStepProps {
  data: SubjectSelectionData;
  onChange: (data: SubjectSelectionData) => void;
  errors?: {
    subjects?: string;
  };
}

export function SubjectSelectionStep({
  data,
  onChange,
  errors
}: SubjectSelectionStepProps) {
  const handleSubjectToggle = (subject: Subject, level: 'AS' | 'A2') => {
    const isSelected = data.selectedSubjects.some(
      s => s.subjectCode === subject.code && s.level === level
    );

    if (isSelected) {
      // Remove subject
      onChange({
        selectedSubjects: data.selectedSubjects.filter(
          s => !(s.subjectCode === subject.code && s.level === level)
        )
      });
    } else {
      // Add subject with its units
      const units = subject.units
        .filter(unit => unit.level === level)
        .map(unit => unit.code);

      onChange({
        selectedSubjects: [
          ...data.selectedSubjects,
          {
            subjectCode: subject.code,
            level,
            units
          }
        ]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      {['Sciences', 'Mathematics'].map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-text">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IALSubjects.filter(subject => subject.category === category).map(subject => (
              <div
                key={subject.code}
                className="border border-border rounded-lg p-4 bg-surface dark:bg-surface-dark"
              >
                <h4 className="font-medium text-text mb-2">{subject.name}</h4>
                
                {/* AS Level */}
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => handleSubjectToggle(subject, 'AS')}
                    className={`px-3 py-1 rounded-full text-sm mr-2 ${
                      data.selectedSubjects.some(
                        s => s.subjectCode === subject.code && s.level === 'AS'
                      )
                        ? 'bg-primary text-white'
                        : 'bg-surface-hover dark:bg-surface-hover-dark text-text-muted'
                    }`}
                  >
                    AS Level
                  </button>
                  <span className="text-sm text-text-muted">
                    {subject.units.filter(u => u.level === 'AS').length} units
                  </span>
                </div>

                {/* A2 Level */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleSubjectToggle(subject, 'A2')}
                    className={`px-3 py-1 rounded-full text-sm mr-2 ${
                      data.selectedSubjects.some(
                        s => s.subjectCode === subject.code && s.level === 'A2'
                      )
                        ? 'bg-primary text-white'
                        : 'bg-surface-hover dark:bg-surface-hover-dark text-text-muted'
                    }`}
                  >
                    A2 Level
                  </button>
                  <span className="text-sm text-text-muted">
                    {subject.units.filter(u => u.level === 'A2').length} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Selected Subjects Summary */}
      <div className="mt-6 p-4 border border-border rounded-lg bg-surface dark:bg-surface-dark">
        <h3 className="font-medium text-text mb-2">Selected Subjects</h3>
        {data.selectedSubjects.length === 0 ? (
          <p className="text-text-muted text-sm">No subjects selected</p>
        ) : (
          <ul className="space-y-2">
            {data.selectedSubjects.map(({ subjectCode, level }) => {
              const subject = IALSubjects.find(s => s.code === subjectCode);
              return (
                <li
                  key={`${subjectCode}-${level}`}
                  className="flex justify-between items-center text-sm text-text"
                >
                  <span>
                    {subject?.name} - {level}
                  </span>
                  <button
                    onClick={() => handleSubjectToggle(
                      subject as Subject,
                      level
                    )}
                    className="text-error hover:text-error-dark"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {errors?.subjects && (
        <p className="mt-2 text-sm text-error">{errors.subjects}</p>
      )}
    </div>
  );
}