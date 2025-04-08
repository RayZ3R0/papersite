"use client";

import { useState } from "react";
import { UserSubjectConfig, Grade } from "@/types/profile";
import SubjectList from "./SubjectList";
import SubjectSelector from "./SubjectSelector";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useRef } from "react";
import { registrationSubjects } from "@/components/auth/registration/subjectData";

interface EditUnitsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: UserSubjectConfig[];
  onSave: (subjects: UserSubjectConfig[]) => Promise<void>;
  onError?: (error: Error) => void;
}

type Tab = "existing" | "add";

export default function EditUnitsDialog({
  isOpen,
  onClose,
  subjects,
  onSave,
  onError,
}: EditUnitsDialogProps) {
  const [editedSubjects, setEditedSubjects] = useState(subjects);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("existing");
  const dialogRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dialogRef, () => {
    if (!isLoading) onClose();
  });

  const handleSubjectUpdate = (updatedSubject: UserSubjectConfig) => {
    setEditedSubjects((currentSubjects) =>
      currentSubjects.map((subject) =>
        subject.subjectCode === updatedSubject.subjectCode
          ? updatedSubject
          : subject
      )
    );
  };

  const handleUnitToggle = (subjectCode: string, unitCode: string) => {
    const subjectData = registrationSubjects[subjectCode];
    if (!subjectData) return;

    const existingSubject = editedSubjects.find(
      (s) => s.subjectCode === subjectCode
    );

    if (existingSubject) {
      // If unit exists, remove it; if it doesn't, add it
      const hasUnit = existingSubject.units.some(
        (u) => u.unitCode === unitCode
      );

      if (hasUnit) {
        // Remove unit
        setEditedSubjects(
          (currentSubjects) =>
            currentSubjects
              .map((s) => {
                if (s.subjectCode !== subjectCode) return s;
                const newUnits = s.units.filter((u) => u.unitCode !== unitCode);
                return newUnits.length === 0 ? null : { ...s, units: newUnits };
              })
              .filter(Boolean) as UserSubjectConfig[]
        );
      } else {
        // Add unit
        setEditedSubjects((currentSubjects) =>
          currentSubjects.map((s) =>
            s.subjectCode === subjectCode
              ? {
                  ...s,
                  units: [
                    ...s.units,
                    {
                      unitCode,
                      planned: false,
                      completed: false,
                      targetGrade: s.overallTarget as Grade,
                      examSession: "May 2025", // Default to next major session
                    },
                  ],
                }
              : s
          )
        );
      }
    } else {
      // Add new subject with this unit
      const newSubject: UserSubjectConfig = {
        subjectCode,
        level: subjectData.type, // Include the level from registration data
        overallTarget: "A", // Default target
        units: [
          {
            unitCode,
            planned: false,
            completed: false,
            targetGrade: "A",
            examSession: "May 2025",
          },
        ],
      };
      setEditedSubjects([...editedSubjects, newSubject]);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(editedSubjects);
      onClose();
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Failed to save changes")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        ref={dialogRef}
        className="bg-background rounded-lg shadow-lg w-full max-w-4xl flex flex-col max-h-[90vh]"
      >
        {/* Dialog Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">Edit Units</h2>
              <p className="text-text-muted mt-1">
                Configure your units and exam sessions
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-text-muted hover:text-text transition-colors disabled:opacity-50"
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

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border -mb-px">
            <button
              onClick={() => setActiveTab("existing")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === "existing"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              Existing Units
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === "add"
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              Add Units
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "existing" ? (
            <SubjectList
              subjects={editedSubjects}
              onSubjectUpdate={handleSubjectUpdate}
            />
          ) : (
            <SubjectSelector
              selectedSubjects={editedSubjects}
              onSubjectChange={handleUnitToggle}
            />
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-6 border-t border-border bg-surface flex justify-end items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text bg-surface-alt hover:bg-surface-alt/80 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
