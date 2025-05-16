import { useState } from 'react';
import { Grade } from '@/types/profile';
import { UserSubjectConfig, TargetGrade, ExamSession } from '@/types/registration';
import UnitConfig from '@/components/profile/UnitConfig';
import { registrationSubjects } from './subjectData';

interface SubjectSelectionStepProps {
  selectedSubjects: UserSubjectConfig[];
  onSelectionChange: (subjects: UserSubjectConfig[]) => void;
  errors?: {
    subjects?: string;
  };
}

export function SubjectSelectionStep({
  selectedSubjects,
  onSelectionChange,
  errors
}: SubjectSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(Object.values(registrationSubjects).map(subject => subject.category))
  );

  // Filter subjects based on search and category
  const filteredSubjects = Object.entries(registrationSubjects).filter(([_, subject]) => {
    const matchesSearch = searchQuery === '' || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || subject.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const updateUnitConfig = (
    subjectId: string, 
    unitId: string, 
    updates: { targetGrade?: TargetGrade; examSession?: ExamSession }
  ) => {
    onSelectionChange(
      selectedSubjects.map(subject => 
        subject.subjectCode === subjectId 
          ? {
              ...subject,
              units: subject.units.map(unit => 
                unit.unitCode === unitId 
                  ? { ...unit, ...updates }
                  : unit
              )
            }
          : subject
      )
    );
  };

  const toggleUnit = (subjectId: string, unitId: string) => {
    const subject = registrationSubjects[subjectId];
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
          onSelectionChange(selectedSubjects.filter(s => s.subjectCode !== subjectId));
        } else {
          // Update units
          onSelectionChange(selectedSubjects.map(s => 
            s.subjectCode === subjectId ? { ...s, units: newUnits } : s
          ));
        }
      } else {
        // Add unit
        onSelectionChange(selectedSubjects.map(s => 
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
        level: subject.type,
        overallTarget: 'A',
        units: [{
          unitCode: unitId,
          planned: false,
          completed: false,
          targetGrade: 'A',
          examSession: 'May 2025'
        }]
      };
      onSelectionChange([...selectedSubjects, newSubject]);
    }
  };

  const isUnitSelected = (subjectId: string, unitId: string) => {
    const subject = selectedSubjects.find(s => s.subjectCode === subjectId);
    return subject?.units.some(u => u.unitCode === unitId) || false;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg text-base
              bg-surface border-2 transition duration-200 outline-none
              border-border hover:border-primary/50 focus:border-primary
              placeholder:text-text-muted/60
            "
          />
        </div>

        {/* Category Filter */}
        <div className="flex-shrink-0">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="
              px-4 py-2 rounded-lg text-base
              bg-surface border-2 transition duration-200 outline-none
              border-border hover:border-primary/50 focus:border-primary
              text-text
            "
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {filteredSubjects.map(([subjectId, subject]) => {
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
                  <p className="text-sm text-text-muted">
                    {subjectId} • {subject.type}
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
                <div className="px-4 pb-4 border-t border-border">
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {subject.units.map((unit) => {
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
                                targetGrade={unitConfig.targetGrade as Grade}
                                examSession={unitConfig.examSession}
                                onGradeChange={(grade) => 
                                  updateUnitConfig(subjectId, unit.id, { targetGrade: grade as TargetGrade })
                                }
                                onSessionChange={(session) => 
                                  updateUnitConfig(subjectId, unit.id, { examSession: session as ExamSession })
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

      {/* Error Message */}
      {errors?.subjects && (
        <p className="mt-2 text-sm text-error font-medium">
          {errors.subjects}
        </p>
      )}
    </div>
  );
}
