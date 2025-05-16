'use client';

import { useState, useEffect } from 'react';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { UserSubjectConfig } from '@/types/profile';
import { EditUnitsDialog } from './UnitEditor';
import { registrationSubjects } from '@/components/auth/registration/subjectData';

interface SubjectDashboardProps {
  subjects: UserSubjectConfig[];
}

export default function SubjectDashboard({ subjects }: SubjectDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateSubjects } = useProfileUpdate();
  const [currentSubjects, setCurrentSubjects] = useState(subjects);

  useEffect(() => {
    setCurrentSubjects(subjects);
  }, [subjects]);

  const handleSave = async (updatedSubjects: UserSubjectConfig[]) => {
    try {
      await updateSubjects(updatedSubjects);
      setCurrentSubjects(updatedSubjects);
    } catch (error) {
      throw error;
    }
  };

  // Group units by session for display
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
          {currentSubjects.length > 0 ? 'Edit Units' : 'Add Units'}
        </button>
      </div>

      {/* Subject Cards */}
      {currentSubjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {currentSubjects.map((subject) => {
            // Get subject details from registration data
            const subjectData = registrationSubjects[subject.subjectCode];
            if (!subjectData || subject.units.length === 0) return null;

            const groupedUnits = groupUnitsBySession(subject);
            const sessions = Object.keys(groupedUnits).sort((a, b) => {
              const [aYear, aMon] = a.split(' ').reverse();
              const [bYear, bMon] = b.split(' ').reverse();
              return aYear === bYear 
                ? ['January', 'May', 'June', 'October'].indexOf(aMon) - ['January', 'May', 'June', 'October'].indexOf(bMon)
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
                        {subject.level} • Target Grade: {subject.overallTarget}
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
                          const unitDetails = subjectData.units.find(u => u.id === unit.unitCode);
                          if (!unitDetails) return null;

                          return (
                            <div
                              key={unit.unitCode}
                              className="px-4 py-3 transition-colors hover:bg-surface/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                  <h4 className="font-medium">{unitDetails.name}</h4>
                                  <p className="text-sm text-text-muted mt-1">
                                    {unitDetails.description}
                                  </p>
                                  {/* Status Indicators */}
                                  <div className="flex items-center gap-3 mt-2">
                                    {unit.completed && (
                                      <span className="inline-flex items-center text-xs font-medium text-success gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Completed{unit.actualGrade && ` • Grade: ${unit.actualGrade}`}
                                      </span>
                                    )}
                                    {!unit.completed && unit.planned && (
                                      <span className="inline-flex items-center text-xs font-medium text-primary gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Planned
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm text-right">
                                  <p className="font-medium">
                                    Target: {unit.targetGrade}
                                  </p>
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

      {/* Unit Editor Dialog */}
      <EditUnitsDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subjects={currentSubjects}
        onSave={handleSave}
        onError={(error) => {
          setError(error.message);
          setTimeout(() => setError(null), 5000);
        }}
      />
    </div>
  );
}
