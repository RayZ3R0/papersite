import { useState } from 'react';
import { Subject, UserSubject } from '@/types/registration';
import { mockSubjects } from '@/lib/data/mock-subjects';

interface SubjectSelectionStepProps {
  selectedSubjects: UserSubject[];
  onSelectionChange: (subjects: UserSubject[]) => void;
  subjects?: Subject[];
  errors?: {
    subjects?: string;
  };
}

export function SubjectSelectionStep({
  selectedSubjects,
  onSelectionChange,
  subjects = mockSubjects,
  errors
}: SubjectSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(subjects.map(subject => subject.category)));

  // Filter subjects based on search and category
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = searchQuery === '' || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || subject.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleSubject = (subject: Subject) => {
    const isSelected = selectedSubjects.some(s => s.subject.code === subject.code);
    
    if (isSelected) {
      onSelectionChange(selectedSubjects.filter(s => s.subject.code !== subject.code));
    } else {
      onSelectionChange([
        ...selectedSubjects,
        {
          subject,
          targetGrade: 'A',
          examSession: 'May 2025'
        }
      ]);
    }
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

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredSubjects.map(subject => {
          const isSelected = selectedSubjects.some(s => s.subject.code === subject.code);
          
          return (
            <button
              key={subject.code}
              onClick={() => toggleSubject(subject)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                hover:border-primary/50 text-left
                ${isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-text">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {subject.code} • {subject.type}
                  </p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 transition-colors
                  flex items-center justify-center
                  ${isSelected 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-border'
                  }
                `}>
                  {isSelected && (
                    <svg 
                      className="w-3 h-3" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="mt-6 p-4 rounded-lg bg-surface-alt border border-border">
        <h4 className="font-medium text-text mb-2">
          Selected Subjects ({selectedSubjects.length})
        </h4>
        {selectedSubjects.length > 0 ? (
          <div className="space-y-2">
            {selectedSubjects.map(({ subject }) => (
              <div 
                key={subject.code}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-text">{subject.name}</span>
                <span className="text-text-muted">{subject.code}</span>
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