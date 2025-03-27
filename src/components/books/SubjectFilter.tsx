'use client';

import { SubjectFilter as SubjectFilterType } from '@/types/book';

interface SubjectFilterProps {
  subjects: SubjectFilterType[];
  selectedSubject: string | null;
  onSubjectChange: (subject: string | null) => void;
}

const SubjectFilter = ({ subjects, selectedSubject, onSubjectChange }: SubjectFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSubjectChange(null)}
        className={`px-3 py-1 rounded-full text-sm transition-colors
          ${!selectedSubject
            ? 'bg-primary text-white'
            : 'bg-surface text-text hover:bg-surface-alt'}`}
      >
        All
      </button>
      {subjects.map((subject) => (
        <button
          key={subject.value}
          onClick={() => onSubjectChange(subject.value)}
          className={`px-3 py-1 rounded-full text-sm transition-colors
            ${selectedSubject === subject.value
              ? 'bg-primary text-white'
              : 'bg-surface text-text hover:bg-surface-alt'}`}
        >
          {subject.label} ({subject.count})
        </button>
      ))}
    </div>
  );
};

export default SubjectFilter;