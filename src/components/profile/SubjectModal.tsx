'use client';

import { useState, useEffect } from 'react';
import { UserSubjectConfig } from '@/hooks/useProfile';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';

interface Subject {
  id: string;
  name: string;
  units: {
    id: string;
    name: string;
    order: number;
    description: string;
  }[];
}

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSubject?: UserSubjectConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const GRADES = ['A*', 'A', 'B', 'C', 'D', 'E'] as const;
const EXAM_SESSIONS = ['January', 'May', 'October'] as const;

export default function SubjectModal({
  isOpen,
  onClose,
  existingSubject,
  onSuccess,
  onError
}: SubjectModalProps) {
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const { updateSubjects, isUpdating } = useProfileUpdate();

  const [formData, setFormData] = useState<Partial<UserSubjectConfig>>({
    subjectCode: '',
    level: 'AS',
    units: [],
    overallTarget: 'A'
  });

  // Fetch subjects data
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/subjects');
        const data = await res.json();
        setSubjects(data.subjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        onError?.(new Error('Failed to load subjects'));
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen, onError]);

  // Set initial form data if editing
  useEffect(() => {
    if (existingSubject) {
      setFormData(existingSubject);
      setSelectedSubject(existingSubject.subjectCode);
    }
  }, [existingSubject]);

  // Update units when subject changes
  useEffect(() => {
    if (selectedSubject && subjects[selectedSubject]) {
      setFormData(prev => ({
        ...prev,
        subjectCode: selectedSubject,
        units: subjects[selectedSubject].units.map(unit => ({
          unitCode: unit.id,
          planned: false,
          completed: false,
          targetGrade: formData.overallTarget || 'A',
          examSession: EXAM_SESSIONS[0]
        }))
      }));
    }
  }, [selectedSubject, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectCode || !formData.level || !formData.units) {
      onError?.(new Error('Please fill in all required fields'));
      return;
    }

    try {
      await updateSubjects([formData as UserSubjectConfig]);
      onSuccess?.();
      onClose();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to save subject'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {existingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 bg-background border rounded-lg"
                  required
                  disabled={isUpdating || !!existingSubject}
                >
                  <option value="">Select a subject</option>
                  {Object.entries(subjects).map(([id, subject]) => (
                    <option key={id} value={id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Level
                </label>
                <div className="flex gap-4">
                  {['AS', 'A2'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        value={level}
                        checked={formData.level === level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as 'AS' | 'A2' })}
                        className="mr-2"
                        required
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              {/* Overall Target Grade */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Grade
                </label>
                <select
                  value={formData.overallTarget}
                  onChange={(e) => setFormData({ ...formData, overallTarget: e.target.value as typeof GRADES[number] })}
                  className="w-full p-2 bg-background border rounded-lg"
                  required
                >
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Configuration */}
              {selectedSubject && subjects[selectedSubject] && (
                <div>
                  <h3 className="font-medium mb-3">Unit Settings</h3>
                  <div className="space-y-4">
                    {formData.units?.map((unit, index) => (
                      <div
                        key={unit.unitCode}
                        className="p-4 bg-surface rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {subjects[selectedSubject].units[index].name}
                            </h4>
                            <p className="text-sm text-text-muted">
                              {subjects[selectedSubject].units[index].description}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <select
                              value={unit.targetGrade}
                              onChange={(e) => {
                                const newUnits = [...(formData.units || [])];
                                newUnits[index] = {
                                  ...unit,
                                  targetGrade: e.target.value as typeof GRADES[number]
                                };
                                setFormData({ ...formData, units: newUnits });
                              }}
                              className="w-full p-2 bg-background border rounded-lg"
                            >
                              {GRADES.map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </select>
                            <select
                              value={unit.examSession}
                              onChange={(e) => {
                                const newUnits = [...(formData.units || [])];
                                newUnits[index] = {
                                  ...unit,
                                  examSession: e.target.value
                                };
                                setFormData({ ...formData, units: newUnits });
                              }}
                              className="w-full p-2 bg-background border rounded-lg"
                            >
                              {EXAM_SESSIONS.map((session) => (
                                <option key={session} value={session}>
                                  {session}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-surface text-text rounded-lg hover:bg-surface/90"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : existingSubject ? 'Update' : 'Add Subject'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}