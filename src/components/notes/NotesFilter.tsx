'use client';

import { useState } from 'react';
import { Subject, Unit } from '@/types/note';
import { ChevronDownIcon } from '@/components/layout/icons';

interface NotesFilterProps {
  subjects: Subject[];
  selectedSubject: Subject | null;
  selectedUnit: Unit | null;
  onSubjectChange: (subject: Subject | null) => void;
  onUnitChange: (unit: Unit | null) => void;
}

export default function NotesFilter({
  subjects,
  selectedSubject,
  selectedUnit,
  onSubjectChange,
  onUnitChange,
}: NotesFilterProps) {
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Subject Filter - Mobile Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
          className="w-full px-4 py-2 bg-surface rounded-lg flex items-center justify-between"
        >
          <span className="text-sm font-medium">
            {selectedSubject ? selectedSubject.name : 'Select Subject'}
          </span>
          <ChevronDownIcon className="w-5 h-5 text-text-muted" />
        </button>
        
        {isSubjectsOpen && (
          <div className="absolute left-0 right-0 mt-2 mx-4 p-2 bg-surface border border-border rounded-lg shadow-lg z-40">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => {
                  onSubjectChange(subject);
                  setIsSubjectsOpen(false);
                  onUnitChange(null);
                }}
                className={`w-full px-3 py-2 text-left rounded-md ${
                  selectedSubject?.id === subject.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-surface-alt'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subject Filter - Desktop Sidebar */}
      <div className="hidden sm:block">
        <h3 className="text-sm font-medium text-text-muted mb-2">Subjects</h3>
        <div className="space-y-1">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => {
                onSubjectChange(subject);
                onUnitChange(null);
              }}
              className={`w-full px-3 py-2 text-left rounded-md transition-colors ${
                selectedSubject?.id === subject.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-surface-alt'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Unit Filter - Only show when subject is selected */}
      {selectedSubject && (
        <>
          {/* Mobile Dropdown */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsUnitsOpen(!isUnitsOpen)}
              className="w-full px-4 py-2 bg-surface rounded-lg flex items-center justify-between"
            >
              <span className="text-sm font-medium">
                {selectedUnit ? selectedUnit.name : 'Select Unit'}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-text-muted" />
            </button>
            
            {isUnitsOpen && (
              <div className="absolute left-0 right-0 mt-2 mx-4 p-2 bg-surface border border-border rounded-lg shadow-lg z-40">
                {selectedSubject.units.map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      onUnitChange(unit);
                      setIsUnitsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-md ${
                      selectedUnit?.id === unit.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-alt'
                    }`}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden sm:block">
            <h3 className="text-sm font-medium text-text-muted mb-2">Units</h3>
            <div className="space-y-1">
              {selectedSubject.units.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => onUnitChange(unit)}
                  className={`w-full px-3 py-2 text-left rounded-md transition-colors ${
                    selectedUnit?.id === unit.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-surface-alt'
                  }`}
                >
                  {unit.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}