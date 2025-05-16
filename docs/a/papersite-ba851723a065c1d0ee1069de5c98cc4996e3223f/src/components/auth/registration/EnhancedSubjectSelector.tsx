import { useState } from 'react';
import { Subject, UserSubjectConfig, TargetGrade, ExamSession } from '@/types/registration';
import { registrationSubjects } from './subjectData';
import { commonCombinations } from '@/lib/data/subjectCombinations';

interface EnhancedSubjectSelectorProps {
  selectedSubjects: UserSubjectConfig[];
  onSelectionChange: (subjects: UserSubjectConfig[]) => void;
  errors?: {
    subjects?: string;
  };
}

const DEFAULT_SESSION: ExamSession = "May 2025";
const DEFAULT_GRADE: TargetGrade = "A";

const toggleCombination = (
  combo: { subjectCodes: string[] },
  allSelected: boolean,
  selectedSubjects: UserSubjectConfig[],
  onSelectionChange: (subjects: UserSubjectConfig[]) => void
) => {
  if (allSelected) {
    // Remove all units in the combination
    const updatedSubjects = selectedSubjects.filter(subject => 
      !subject.units.some(unit => combo.subjectCodes.includes(unit.unitCode))
    );
    onSelectionChange(updatedSubjects);
  } else {
    // Add all units in the combination
    const newUnits = combo.subjectCodes.map(unitId => {
      // Find which subject this unit belongs to
      for (const [subjectCode, subject] of Object.entries(registrationSubjects)) {
        const unit = subject.units.find(u => u.id === unitId);
        if (unit) {
          return {
            subjectCode,
            unitId,
            subject
          };
        }
      }
      return null;
    }).filter(Boolean) as { subjectCode: string; unitId: string; subject: Subject }[];

    // Group units by subject
    const unitsBySubject = newUnits.reduce((acc, data) => {
      if (!acc[data.subjectCode]) {
        acc[data.subjectCode] = {
          subject: data.subject,
          units: []
        };
      }
      acc[data.subjectCode].units.push(data.unitId);
      return acc;
    }, {} as Record<string, { subject: Subject, units: string[] }>);

    // Update the subjects
    const currentSubjects = [...selectedSubjects];
    Object.entries(unitsBySubject).forEach(([subjectCode, data]) => {
      const existingSubject = currentSubjects.find(s => s.subjectCode === subjectCode);
      if (existingSubject) {
        // Add new units to existing subject
        data.units.forEach(unitId => {
          if (!existingSubject.units.some(u => u.unitCode === unitId)) {
            existingSubject.units.push({
              unitCode: unitId,
              planned: false,
              completed: false,
              targetGrade: DEFAULT_GRADE,
              examSession: DEFAULT_SESSION
            });
          }
        });
      } else {
        // Create new subject with units
        currentSubjects.push({
          subjectCode,
          level: data.subject.type,
          overallTarget: DEFAULT_GRADE,
          units: data.units.map(unitId => ({
            unitCode: unitId,
            planned: false,
            completed: false,
            targetGrade: DEFAULT_GRADE,
            examSession: DEFAULT_SESSION
          }))
        });
      }
    });

    onSelectionChange(currentSubjects);
  }
};

export function EnhancedSubjectSelector({
  selectedSubjects,
  onSelectionChange,
  errors
}: EnhancedSubjectSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combinations' | 'individual'>('combinations');

  // Get unique categories from subjects
  const categories = Array.from(
    new Set(Object.values(registrationSubjects).map(subject => subject.category))
  );

  const isUnitSelected = (subjectCode: string, unitId: string) => {
    const subject = selectedSubjects.find(s => s.subjectCode === subjectCode);
    return subject?.units.some(u => u.unitCode === unitId) || false;
  };

  const toggleUnit = (subjectCode: string, subject: Subject, unitId: string) => {
    const existingSubject = selectedSubjects.find(s => s.subjectCode === subjectCode);

    if (existingSubject) {
      // Check if unit exists
      const hasUnit = existingSubject.units.some(u => u.unitCode === unitId);
      
      if (hasUnit) {
        // Remove unit
        const newUnits = existingSubject.units.filter(u => u.unitCode !== unitId);
        if (newUnits.length === 0) {
          // If no units left, remove the subject
          onSelectionChange(selectedSubjects.filter(s => s.subjectCode !== subjectCode));
        } else {
          // Update units
          onSelectionChange(selectedSubjects.map(s => 
            s.subjectCode === subjectCode ? { ...s, units: newUnits } : s
          ));
        }
      } else {
        // Add unit
        onSelectionChange(selectedSubjects.map(s => 
          s.subjectCode === subjectCode ? {
            ...s,
            units: [...s.units, {
              unitCode: unitId,
              planned: false,
              completed: false,
              targetGrade: DEFAULT_GRADE,
              examSession: DEFAULT_SESSION
            }]
          } : s
        ));
      }
    } else {
      // Add new subject with this unit
      const newSubject: UserSubjectConfig = {
        subjectCode,
        level: subject.type,
        overallTarget: DEFAULT_GRADE,
        units: [{
          unitCode: unitId,
          planned: false,
          completed: false,
          targetGrade: DEFAULT_GRADE,
          examSession: DEFAULT_SESSION
        }]
      };
      onSelectionChange([...selectedSubjects, newSubject]);
    }
  };

  // Filter subjects by category
  const filteredSubjects = Object.entries(registrationSubjects)
    .filter(([_, subject]) => !selectedCategory || subject.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
            transition-colors duration-200
            ${!selectedCategory 
              ? 'bg-primary text-white' 
              : 'bg-surface hover:bg-surface-alt text-text'}
          `}
        >
          All Subjects
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              ${selectedCategory === category 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-surface-alt text-text'}
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex rounded-lg border-2 border-border p-1">
        <button
          onClick={() => setActiveTab('combinations')}
          className={`
            flex-1 py-2 rounded-md text-sm font-medium
            transition-colors duration-200
            ${activeTab === 'combinations' 
              ? 'bg-primary text-white' 
              : 'hover:bg-surface-alt text-text'}
          `}
        >
          Common Combinations
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          className={`
            flex-1 py-2 rounded-md text-sm font-medium
            transition-colors duration-200
            ${activeTab === 'individual' 
              ? 'bg-primary text-white' 
              : 'hover:bg-surface-alt text-text'}
          `}
        >
          Individual Subjects
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'combinations' ? (
          <div className="space-y-6">
            {Object.entries(commonCombinations)
              .filter(([category]) => !selectedCategory || category === selectedCategory)
              .map(([category, combinations]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-lg text-text">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {combinations.map(combo => {
                      const allSelected = combo.subjectCodes.every(id => {
                        for (const subject of selectedSubjects) {
                          if (subject.units.some(u => u.unitCode === id)) {
                            return true;
                          }
                        }
                        return false;
                      });

                      const someSelected = combo.subjectCodes.some(id => {
                        for (const subject of selectedSubjects) {
                          if (subject.units.some(u => u.unitCode === id)) {
                            return true;
                          }
                        }
                        return false;
                      });

                      return (
                        <button
                          key={combo.id}
                          onClick={() => toggleCombination(combo, allSelected, selectedSubjects, onSelectionChange)}
                          className={`
                            p-4 rounded-lg border-2 text-left transition-all duration-200
                            ${allSelected 
                              ? 'border-primary bg-primary/5' 
                              : someSelected
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border hover:border-primary/50'}
                          `}
                        >
                          <h4 className="font-medium text-text">{combo.name}</h4>
                          <p className="text-sm text-text-muted mt-1">{combo.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-alt text-text">
                              {combo.level}
                            </span>
                            <span className="text-xs text-text-muted">
                              {combo.subjectCodes.length} units
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubjects.map(([subjectCode, subject]) => {
              const subjectConfig = selectedSubjects.find(s => s.subjectCode === subjectCode);
              const selectedUnitsCount = subjectConfig?.units.length || 0;

              return (
                <div 
                  key={subjectCode}
                  className={`
                    rounded-lg border-2 overflow-hidden transition-all duration-200
                    ${selectedUnitsCount > 0 
                      ? 'border-primary' 
                      : 'border-border'}
                  `}
                >
                  <div className="p-4">
                    <h3 className="font-medium flex items-center gap-2">
                      {subject.name}
                      {selectedUnitsCount > 0 && (
                        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {selectedUnitsCount} unit{selectedUnitsCount !== 1 ? 's' : ''} selected
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {subjectCode} • {subject.type}
                    </p>
                  </div>

                  <div className="border-t border-border px-4 py-3 bg-surface-alt/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subject.units.map((unit) => {
                        const isSelected = isUnitSelected(subjectCode, unit.id);
                        
                        return (
                          <button
                            key={unit.id}
                            onClick={() => toggleUnit(subjectCode, subject, unit.id)}
                            className={`
                              p-3 rounded text-left transition-colors flex items-center gap-3
                              ${isSelected 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-surface-alt text-text'}
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
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Units Summary */}
      <div className="mt-4 p-4 rounded-lg bg-surface-alt border border-border">
        <h4 className="font-medium mb-2">Selected Units Summary</h4>
        {selectedSubjects.length > 0 ? (
          <div className="space-y-4">
            {selectedSubjects.map((subject) => {
              const subjectData = registrationSubjects[subject.subjectCode];
              if (!subjectData) return null;
              
              return (
                <div key={subject.subjectCode} className="border rounded p-3">
                  <p className="font-medium">{subjectData.name}</p>
                  <div className="mt-2 space-y-1">
                    {subject.units.map(unit => {
                      const unitData = subjectData.units.find(u => u.id === unit.unitCode);
                      return (
                        <p key={unit.unitCode} className="text-sm text-text-muted">
                          {unitData?.name}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No units selected. Select at least one unit to continue.
          </p>
        )}
      </div>

      {/* Error Message */}
      {errors?.subjects && (
        <p className="mt-2 text-sm text-error font-medium">
          {errors.subjects}
        </p>
      )}
    </div>
  );
}
