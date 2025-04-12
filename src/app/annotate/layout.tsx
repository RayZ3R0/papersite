'use client';

import { Header, Sidebar, MainContent } from '@/components/annotate/layout';
import { Subject } from '@/types/annotate';
import { useEffect, useState } from 'react';

// Temporary mock data - replace with actual data fetch
const mockSubjects: Subject[] = [
  { id: 'physics', name: 'Physics', unitCount: 6 },
  { id: 'chemistry', name: 'Chemistry', unitCount: 4 },
  { id: 'biology', name: 'Biology', unitCount: 5 },
  { id: 'math', name: 'Mathematics', unitCount: 8 }
];

export default function AnnotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);

  // Replace with actual data fetching when ready
  useEffect(() => {
    // Fetch subjects data here
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar subjects={subjects} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}