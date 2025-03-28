'use client';

interface SubjectFilterProps {
  subjects: string[];
  selectedSubject: string | null;
  onChange: (subject: string | null) => void;
}

export default function SubjectFilter({
  subjects,
  selectedSubject,
  onChange
}: SubjectFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
          ${!selectedSubject
            ? 'bg-primary text-white'
            : 'bg-surface hover:bg-surface-alt text-text'
          }`}
      >
        All
      </button>
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => onChange(subject)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selectedSubject === subject
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-surface-alt text-text'
            }`}
        >
          {subject}
        </button>
      ))}
    </div>
  );
}