import { useState } from 'react';
import { Subject, UserSubject, TargetGrade, ExamSession } from '@/types/registration';
import { mockSubjects } from '@/lib/data/mock-subjects';
import { commonCombinations } from '@/lib/data/subjectCombinations';

interface EnhancedSubjectSelectorProps {
  selectedSubjects: UserSubject[];
  onSelectionChange: (subjects: UserSubject[]) => void;
  subjects?: Subject[];
  errors?: {
    subjects?: string;
  };
}

const DEFAULT_SESSION: ExamSession = "May 2025";
const DEFAULT_GRADE: TargetGrade = "A";

export function EnhancedSubjectSelector({
  selectedSubjects,
  onSelectionChange,
  subjects = mockSubjects,
  errors
}: EnhancedSubjectSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combinations' | 'individual'>('combinations');

  // Get unique categories
  const categories = Array.from(new Set(subjects.map(subject => subject.category)));

  const isSubjectSelected = (code: string) => 
    selectedSubjects.some(s => s.subject.code === code);

  const toggleSubject = (code: string) => {
    const subject = subjects.find(s => s.code === code);
    if (!subject) return;

    if (isSubjectSelected(code)) {
      onSelectionChange(selectedSubjects.filter(s => s.subject.code !== code));
    } else {
      onSelectionChange([
        ...selectedSubjects,
        {
          subject,
          targetGrade: DEFAULT_GRADE,
          examSession: DEFAULT_SESSION
        }
      ]);
    }
  };

  const selectCombination = (subjectCodes: string[]) => {
    const newSubjects = subjectCodes
      .map(code => subjects.find(s => s.code === code))
      .filter((subject): subject is Subject => subject !== undefined)
      .map(subject => ({
        subject,
        targetGrade: DEFAULT_GRADE,
        examSession: DEFAULT_SESSION
      }));

    // Filter out already selected subjects
    const filteredNewSubjects = newSubjects.filter(
      newSubject => !selectedSubjects.some(
        selected => selected.subject.code === newSubject.subject.code
      )
    );

    onSelectionChange([...selectedSubjects, ...filteredNewSubjects]);
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
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
          Individual Units
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
                      const allSelected = combo.subjectCodes.every(isSubjectSelected);
                      const someSelected = combo.subjectCodes.some(isSubjectSelected);
                      
                      return (
                        <button
                          key={combo.id}
                          onClick={() => selectCombination(combo.subjectCodes)}
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
            {Object.entries(
              subjects
                .filter(s => !selectedCategory || s.category === selectedCategory)
                .reduce((acc, subject) => ({
                  ...acc,
                  [subject.category]: [...(acc[subject.category] || []), subject]
                }), {} as Record<string, Subject[]>)
            ).map(([category, subjects]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-medium text-lg text-text">{category}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {subjects.map(subject => {
                    const isSelected = isSubjectSelected(subject.code);
                    
                    return (
                      <button
                        key={subject.code}
                        onClick={() => toggleSubject(subject.code)}
                        className={`
                          p-3 rounded-lg border-2 text-left transition-all duration-200
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'}
                        `}
                      >
                        <p className="font-medium text-sm text-text">{subject.code}</p>
                        <p className="text-xs text-text-muted mt-1">{subject.type}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="mt-6 p-4 rounded-lg bg-surface-alt border border-border">
        <h4 className="font-medium text-text mb-2">
          Selected Units ({selectedSubjects.length})
        </h4>
        {selectedSubjects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {selectedSubjects.map(({ subject }) => (
              <div 
                key={subject.code}
                className="p-2 rounded bg-surface border border-border"
              >
                <p className="text-sm font-medium text-text">{subject.code}</p>
                <p className="text-xs text-text-muted">{subject.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No subjects selected. Select at least one subject to continue.
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