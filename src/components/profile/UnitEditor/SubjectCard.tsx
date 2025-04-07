'use client';

import { useState } from 'react';
import { UserSubjectConfig } from '@/types/profile';
import UnitCard from './UnitCard';
import { registrationSubjects } from '@/components/auth/registration/subjectData';

interface SubjectCardProps {
  subject: UserSubjectConfig;
  onUpdate: (updatedSubject: UserSubjectConfig) => void;
}

export default function SubjectCard({
  subject,
  onUpdate
}: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get subject details from registration data
  const subjectDetails = registrationSubjects[subject.subjectCode];

  if (!subjectDetails) return null;

  return (
    <div className={`
      rounded-lg border-2 transition-all duration-200
      ${subject.units.length > 0 ? 'border-primary' : 'border-border'}
    `}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex justify-between items-center"
      >
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            {subjectDetails.name}
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
              {subject.units.length} unit{subject.units.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <p className="text-sm text-text-muted mt-0.5">
            {subject.subjectCode} {/* Removed level as requested */}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-4 grid grid-cols-1 gap-3">
            {subject.units.map((unit) => {
              const unitDetails = subjectDetails.units.find(u => u.id === unit.unitCode);
              if (!unitDetails) return null;

              return (
                <UnitCard
                  key={unit.unitCode}
                  unit={unit}
                  unitName={unitDetails.name}
                  unitDescription={unitDetails.description}
                  onUpdate={(updatedUnit) => {
                    onUpdate({
                      ...subject,
                      units: subject.units.map(u =>
                        u.unitCode === updatedUnit.unitCode ? updatedUnit : u
                      )
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
