'use client';

import { useState } from 'react';
import { UserSubjectConfig, Grade } from '@/types/profile';
import { SubjectsData } from '@/types/subject';
import subjectsData from '@/lib/data/subjects.json';
import UnitConfig from './UnitConfig';

interface EditSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubjects: UserSubjectConfig[];
  onSave: (subjects: UserSubjectConfig[]) => Promise<void>;
  onError?: (error: Error) => void;
}

const subjects = (subjectsData as SubjectsData).subjects;

export default function EditSubjectsModal({
  isOpen,
  onClose,
  currentSubjects,
  onSave,
  onError
}: EditSubjectsModalProps) {
  const [selectedSubjects, setSelectedSubjects] = useState(currentSubjects);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(selectedSubjects);
      onClose();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to save subjects'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnitConfig = (
    subjectId: string, 
    unitId: string, 
    updates: { targetGrade?: Grade; examSession?: string }
  ) => {
    setSelectedSubjects(subjects => 
      subjects.map(subject => {
        if (subject.subjectCode !== subjectId) return subject;

        return {
          ...subject,
          units: subject.units.map(unit => 
            unit.unitCode === unitId 
              ? { ...unit, ...updates }
              : unit
          )
        };
      })
    );
  };

  const toggleUnit = (subjectId: string, unitId: string) => {
    const subject = subjects[subjectId as keyof typeof subjects];
    if (!subject) return;

    const unit = subject.units.find(u => u.id === unitId);
    if (!unit) return;

    const existingSubject = selectedSubjects.find(s => s.subjectCode === subjectId);

    if (existingSubject) {
      // If the unit exists, remove it; if it doesn't, add it
      const hasUnit = existingSubject.units.some(u => u.unitCode === unitId);
      
      if (hasUnit) {
        // Remove unit
        const newUnits = existingSubject.units.filter(u => u.unitCode !== unitId);
        if (newUnits.length === 0) {
          // If no units left, remove the subject
          setSelectedSubjects(selectedSubjects.filter(s => s.subjectCode !== subjectId));
        } else {
          // Update units
          setSelectedSubjects(selectedSubjects.map(s => 
            s.subjectCode === subjectId ? { ...s, units: newUnits } : s
          ));
        }
      } else {
        // Add unit
        setSelectedSubjects(selectedSubjects.map(s => 
          s.subjectCode === subjectId ? {
            ...s,
            units: [...s.units, {
              unitCode: unitId,
              planned: false,
              completed: false,
              targetGrade: 'A',
              examSession: 'May 2025'
            }]
          } : s
        ));
      }
    } else {
      // Add new subject with this unit
      const newSubject: UserSubjectConfig = {
        subjectCode: subjectId,
        level: 'AS',
        overallTarget: 'A',
        units: [{
          unitCode: unitId,
          planned: false,
          completed: false,
          targetGrade: 'A',
          examSession: 'May 2025'
        }]
      };
      setSelectedSubjects([...selectedSubjects, newSubject]);
    }
  };

  const isUnitSelected = (subjectId: string, unitId: string) => {
    const subject = selectedSubjects.find(s => s.subjectCode === subjectId);
    return subject?.units.some(u => u.unitCode === unitId) || false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 flex justify-between items-start border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Select Units</h2>
            <p className="text-text-muted mt-1">Choose which units you want to study</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Subject Selection */}
          <div className="space-y-4">
            {(Object.entries(subjects) as [string, any][]).map(([subjectId, subject]) => {
              const isExpanded = expandedSubject === subjectId;
              const selectedUnitsCount = selectedSubjects.find(s => s.subjectCode === subjectId)?.units.length || 0;
              const subjectConfig = selectedSubjects.find(s => s.subjectCode === subjectId);
              
              return (
                <div
                  key={subjectId}
                  className={`
                    rounded-lg border-2 transition-all duration-200
                    ${selectedUnitsCount > 0 
                      ? 'border-primary' 
                      : 'border-border'}
                  `}
                >
                  <button
                    onClick={() => setExpandedSubject(isExpanded ? null : subjectId)}
                    className="w-full p-4 text-left flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {subject.name}
                        {selectedUnitsCount > 0 && (
                          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {selectedUnitsCount} unit{selectedUnitsCount !== 1 ? 's' : ''} selected
                          </span>
                        )}
                      </h3>
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
                    <div className="px-4 pb-4 border-t border-border">
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        {subject.units.map((unit: any) => {
                          const isSelected = isUnitSelected(subjectId, unit.id);
                          const unitConfig = subjectConfig?.units.find(u => u.unitCode === unit.id);

                          return (
                            <div key={unit.id} className="space-y-2">
                              <button
                                onClick={() => toggleUnit(subjectId, unit.id)}
                                className={`
                                  w-full p-3 rounded text-left transition-colors flex items-center gap-3
                                  ${isSelected 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'hover:bg-surface-alt'}
                                `}
                              >
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                                  ${isSelected 
                                    ? 'border-primary bg-primary text-white' 
                                    : 'border-text-muted'}
                                `}>
                                  {isSelected && (
                                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <div className="font-medium">{unit.name}</div>
                                  <div className="text-sm text-text-muted">{unit.description}</div>
                                </div>
                              </button>

                              {isSelected && unitConfig && (
                                <div className="pl-8">
                                  <UnitConfig
                                    unitName={unit.name}
                                    targetGrade={unitConfig.targetGrade}
                                    examSession={unitConfig.examSession}
                                    onGradeChange={(grade) => 
                                      updateUnitConfig(subjectId, unit.id, { targetGrade: grade })
                                    }
                                    onSessionChange={(session) => 
                                      updateUnitConfig(subjectId, unit.id, { examSession: session })
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex justify-between items-center">
          <div className="text-sm text-text-muted">
            {selectedSubjects.reduce((acc, subject) => acc + subject.units.length, 0)} unit
            {selectedSubjects.reduce((acc, subject) => acc + subject.units.length, 0) !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text bg-surface hover:bg-surface-alt rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}