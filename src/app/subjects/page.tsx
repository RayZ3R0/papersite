'use client';

import Link from 'next/link';
import subjectsData from '@/lib/data/subjects.json';
import type { SubjectsData } from '@/types/subject';

export default function SubjectsPage() {
  // Get subjects from the data file
  const { subjects } = subjectsData as SubjectsData;

  // Calculate total papers for each subject
  const getSubjectStats = (subjectId: string) => {
    const subject = subjects[subjectId];
    const totalPapers = subject.papers.length;
    const totalUnits = subject.units.length;
    return { totalPapers, totalUnits };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
          All Subjects
        </h1>
        <p className="text-text-muted">
          Browse through all available subjects and their papers
        </p>
      </header>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(subjects).map(([id, subject]) => {
          const { totalPapers, totalUnits } = getSubjectStats(id);
          
          return (
            <Link
              key={id}
              href={`/subjects/${id}`}
              className="group block overflow-hidden rounded-lg border border-border 
                bg-surface hover:shadow-lg transition-all"
            >
              <div className="p-6">
                {/* Subject Title */}
                <h2 className="text-xl font-semibold text-text group-hover:text-primary 
                  transition-colors">
                  {subject.name}
                </h2>

                {/* Stats */}
                <div className="mt-3 space-y-1 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{totalUnits} Units</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{totalPapers} Papers</span>
                  </div>
                </div>

                {/* Quick Access Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/latest#${id}`}
                    className="px-3 py-1 text-sm bg-surface-alt hover:bg-surface-alt/80
                      text-text rounded-full transition-colors"
                  >
                    Latest Papers
                  </Link>
                  <Link
                    href={`/subjects/${id}`}
                    className="px-3 py-1 text-sm bg-surface-alt hover:bg-surface-alt/80
                      text-text rounded-full transition-colors"
                  >
                    View Units
                  </Link>
                </div>

                {/* Latest Update */}
                <div className="mt-4 text-xs text-text-muted">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}