import { useState } from 'react';
import { Subject, UserSubjectConfig, ExamSession } from '@/types/registration';
import { registrationSubjects } from '@/components/auth/registration/subjectData';

interface SubjectSelectorProps {
  subjects: UserSubjectConfig[];
  onUpdateSubjects: (subjects: UserSubjectConfig[]) => void;
}

const AVAILABLE_SESSIONS: ExamSession[] = [
  "May 2025",
  "October 2025",
  "January 2026",
  "May 2026"
];

export function SubjectSelector({ subjects, onUpdateSubjects }: SubjectSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(Object.values(registrationSubjects).map(subject => subject.category))
  );

  const updateUnitDetails = (
    subjectCode: string, 
    unitId: string, 
    updates: Partial<{ planned: boolean; completed: boolean; examSession: ExamSession; }>
  ) => {
    onUpdateSubjects(subjects.map(subject => {
      if (subject.subjectCode === subjectCode) {
        return {
          ...subject,
          units: subject.units.map(unit => 
            unit.unitCode === unitId 
              ? { ...unit, ...updates }
              : unit
          )
        };
      }
      return subject;
    }));
  };

  const toggleUnit = (subjectCode: string, subject: Subject, unitId: string) => {
    const existingSubject = subjects.find(s => s.subjectCode === subjectCode);

    if (existingSubject) {
      if (existingSubject.units.some(u => u.unitCode === unitId)) {
        // Remove unit
        const newUnits = existingSubject.units.filter(u => u.unitCode !== unitId);
        if (newUnits.length === 0) {
          onUpdateSubjects(subjects.filter(s => s.subjectCode !== subjectCode));
        } else {
          onUpdateSubjects(subjects.map(s => 
            s.subjectCode === subjectCode ? { ...s, units: newUnits } : s
          ));
        }
      } else {
        // Add unit
        onUpdateSubjects(subjects.map(s => 
          s.subjectCode === subjectCode ? {
            ...s,
            units: [...s.units, {
              unitCode: unitId,
              planned: false,
              completed: false,
              targetGrade: existingSubject.overallTarget,
              examSession: "May 2025"
            }]
          } : s
        ));
      }
    } else {
      // Add new subject with this unit
      onUpdateSubjects([...subjects, {
        subjectCode,
        level: subject.type,
        overallTarget: "A",
        units: [{
          unitCode: unitId,
          planned: false,
          completed: false,
          targetGrade: "A",
          examSession: "May 2025"
        }]
      }]);
    }
  };

  // Get filtered subjects
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

      {/* Subject List */}
      <div className="space-y-6">
        {filteredSubjects.map(([subjectCode, subject]) => {
          const subjectConfig = subjects.find(s => s.subjectCode === subjectCode);
          const selectedUnitsCount = subjectConfig?.units.length || 0;

          return (
            <div 
              key={subjectCode}
              className={`
                rounded-lg border overflow-hidden transition-all duration-200
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

              <div className="border-t border-border divide-y divide-border">
                {subject.units.map((unit) => {
                  const selectedUnit = subjectConfig?.units.find(u => u.unitCode === unit.id);
                  const isSelected = !!selectedUnit;
                  
                  return (
                    <div
                      key={unit.id}
                      className={`
                        p-4 transition-colors flex flex-col sm:flex-row sm:items-center gap-4
                        ${isSelected 
                          ? 'bg-surface text-text' 
                          : 'hover:bg-surface-alt text-text-muted'}
                      `}
                    >
                      {/* Unit Info */}
                      <div className="flex-grow flex items-start gap-3">
                        <button
                          onClick={() => toggleUnit(subjectCode, subject, unit.id)}
                          className="mt-1"
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
                        </button>
                        <div className="flex-grow">
                          <div className="font-medium">{unit.name}</div>
                          <div className="text-sm text-text-muted">{unit.description}</div>
                        </div>
                      </div>

                      {/* Unit Controls */}
                      {isSelected && (
                        <div className="flex flex-wrap items-center gap-3 ml-8 sm:ml-0">
                          <select
                            value={selectedUnit.examSession}
                            onChange={(e) => updateUnitDetails(
                              subjectCode,
                              unit.id,
                              { examSession: e.target.value as ExamSession }
                            )}
                            className="min-w-[140px] rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
                          >
                            {AVAILABLE_SESSIONS.map(session => (
                              <option key={session} value={session}>
                                {session}
                              </option>
                            ))}
                          </select>

                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.planned}
                              onChange={(e) => updateUnitDetails(
                                subjectCode,
                                unit.id,
                                { planned: e.target.checked }
                              )}
                              className="rounded border-text-muted text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Planned</span>
                          </label>

                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.completed}
                              onChange={(e) => updateUnitDetails(
                                subjectCode,
                                unit.id,
                                { completed: e.target.checked }
                              )}
                              className="rounded border-text-muted text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Completed</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
