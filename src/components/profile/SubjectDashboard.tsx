'use client';

import { useState } from 'react';
import { UserSubjectConfig } from '@/hooks/useProfile';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import EditSubjectsModal from './EditSubjectsModal';
import { SubjectsData } from '@/types/subject';
import subjectsData from '@/lib/data/subjects.json';

interface SubjectDashboardProps {
  subjects: UserSubjectConfig[];
}

const subjectsList = (subjectsData as SubjectsData).subjects;

function groupUnitsBySession(subject: UserSubjectConfig) {
  return subject.units.reduce((acc, unit) => {
    const session = unit.examSession;
    if (!acc[session]) {
      acc[session] = [];
    }
    acc[session].push(unit);
    return acc;
  }, {} as Record<string, typeof subject.units>);
}

export default function SubjectDashboard({ subjects }: SubjectDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateSubjects } = useProfileUpdate();

  const handleSave = async (updatedSubjects: UserSubjectConfig[]) => {
    try {
      await updateSubjects(updatedSubjects);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Units</h2>
          <p className="text-text-muted mt-1">Manage your exam units and track progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {subjects.length > 0 ? 'Edit Units' : 'Add Units'}
        </button>
      </div>

      {/* Subject Cards */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {subjects.map((subject) => {
            const subjectData = subjectsList[subject.subjectCode as keyof typeof subjectsList];
            if (!subjectData || subject.units.length === 0) return null;

            const groupedUnits = groupUnitsBySession(subject);
            const sessions = Object.keys(groupedUnits).sort((a, b) => {
              const [aYear, aMon] = a.split(' ').reverse();
              const [bYear, bMon] = b.split(' ').reverse();
              return aYear === bYear 
                ? ['May', 'June', 'October', 'January'].indexOf(aMon) - ['May', 'June', 'October', 'January'].indexOf(bMon)
                : Number(aYear) - Number(bYear);
            });

            return (
              <div
                key={subject.subjectCode}
                className="rounded-lg border border-border overflow-hidden bg-surface"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{subjectData.name}</h3>
                      <p className="text-text-muted text-sm">
                        Target: {subject.overallTarget} • Level: {subject.level}
                      </p>
                    </div>
                    <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {subject.units.length} unit{subject.units.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Units By Session */}
                <div className="divide-y divide-border">
                  {sessions.map(session => (
                    <div key={session} className="bg-surface/50">
                      <div className="px-4 py-2 bg-surface/80 border-b border-border">
                        <h4 className="text-sm font-medium text-text-muted">
                          {session} Session
                        </h4>
                      </div>
                      <div className="divide-y divide-border/50">
                        {groupedUnits[session].map((unit) => {
                          const unitData = subjectData.units.find(u => u.id === unit.unitCode);
                          if (!unitData) return null;

                          return (
                            <div
                              key={unit.unitCode}
                              className="px-4 py-3 transition-colors hover:bg-surface/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{unitData.name}</h4>
                                  </div>
                                  <p className="text-sm text-text-muted mt-1">
                                    {unitData.description}
                                  </p>
                                </div>
                                <div className="text-sm text-right">
                                  <p className="font-medium">
                                    Target: {unit.targetGrade}
                                  </p>
                                  {unit.actualGrade && (
                                    <p className="text-text-muted mt-1">
                                      Achieved: {unit.actualGrade}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 bg-surface rounded-lg">
          <p className="text-text-muted mb-4">No units selected yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Your First Unit
          </button>
        </div>
      )}

      {/* Unit Edit Modal */}
      <EditSubjectsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentSubjects={subjects}
        onSave={handleSave}
        onError={(error) => {
          setError(error.message);
          setTimeout(() => setError(null), 5000);
        }}
      />
    </div>
  );
}