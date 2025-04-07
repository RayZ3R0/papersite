'use client';

import { useState } from 'react';
import { UserSubjectConfig } from '@/types/profile';
import { registrationSubjects } from '@/components/auth/registration/subjectData';

interface SubjectSelectorProps {
  selectedSubjects: UserSubjectConfig[];
  onSubjectChange: (subjectCode: string, unitCode: string) => void;
}

export default function SubjectSelector({
  selectedSubjects,
  onSubjectChange
}: SubjectSelectorProps) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(Object.values(registrationSubjects).map(subject => subject.category))
  );

  // Get list of subjects based on selected category
  const filteredSubjects = Object.entries(registrationSubjects).filter(([_, subject]) =>
    !selectedCategory || subject.category === selectedCategory
  );

  const isUnitSelected = (subjectCode: string, unitCode: string) => {
    const subject = selectedSubjects.find(s => s.subjectCode === subjectCode);
    return subject?.units.some(u => u.unitCode === unitCode) || false;
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="w-full px-4 py-2 rounded-lg text-base bg-surface border-2 transition duration-200 outline-none border-border hover:border-primary/50 focus:border-primary"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Subject List */}
      <div className="space-y-4">
        {filteredSubjects.map(([subjectCode, subject]) => {
          const isExpanded = expandedSubject === subjectCode;
          const selectedUnitsForSubject = selectedSubjects.find(s => s.subjectCode === subjectCode)?.units || [];

          return (
            <div
              key={subjectCode}
              className="rounded-lg border-2 border-border"
            >
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : subjectCode)}
                className="w-full p-4 text-left flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    {subject.name}
                    {selectedUnitsForSubject.length > 0 && (
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {selectedUnitsForSubject.length} selected
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {subjectCode} • {subject.type}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-border">
                  <div className="grid grid-cols-1 gap-2">
                    {subject.units.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => onSubjectChange(subjectCode, unit.id)}
                        className={`
                          w-full p-3 rounded text-left transition-colors flex items-center gap-3
                          ${isUnitSelected(subjectCode, unit.id)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-surface-alt'}
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                          ${isUnitSelected(subjectCode, unit.id)
                            ? 'border-primary bg-primary text-white'
                            : 'border-text-muted'}
                        `}>
                          {isUnitSelected(subjectCode, unit.id) && (
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{unit.name}</div>
                          <div className="text-sm text-text-muted">{unit.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
