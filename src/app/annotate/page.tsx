'use client';

import { useState } from 'react';

interface Subject {
  id: string;
  name: string;
  units: number;
  icon?: string;
}

// Mock data - replace with actual data
const mockSubjects = [
  { id: 'physics', name: 'Physics', units: 6 },
  { id: 'chemistry', name: 'Chemistry', units: 4 },
  { id: 'biology', name: 'Biology', units: 5 },
  { id: 'math', name: 'Mathematics', units: 8 }
];

function SubjectCard({ id, name, units, icon }: Subject) {
  return (
    <a
      href={`/annotate/${id}`}
      className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {icon ? (
            <img src={icon} alt="" className="h-6 w-6" />
          ) : (
            <span className="text-xl font-semibold">{name[0]}</span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold tracking-tight">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {units} {units === 1 ? 'Unit' : 'Units'}
        </p>
      </div>
    </a>
  );
}

export default function AnnotatePage() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Papers</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} {...subject} />
        ))}
      </div>
    </div>
  );
}
