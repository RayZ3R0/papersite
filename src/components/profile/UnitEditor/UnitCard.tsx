"use client";

import { UserUnit } from "@/types/profileTypes";
import { GRADE_OPTIONS, SESSION_OPTIONS } from "@/types/profileTypes";

interface UnitCardProps {
  unit: UserUnit;
  unitName: string;
  unitDescription: string;
  onUpdate: (updatedUnit: UserUnit) => void;
}

export default function UnitCard({
  unit,
  unitName,
  unitDescription,
  onUpdate,
}: UnitCardProps) {
  const handleCompleteToggle = () => {
    onUpdate({
      ...unit,
      completed: !unit.completed,
      planned: !unit.completed ? false : unit.planned,
    });
  };

  const handlePlannedToggle = () => {
    onUpdate({
      ...unit,
      planned: !unit.planned,
      completed: false, // Reset completed when marking as planned
    });
  };

  const handleTargetGradeChange = (grade: (typeof GRADE_OPTIONS)[number]) => {
    onUpdate({
      ...unit,
      targetGrade: grade,
    });
  };

  const handleActualGradeChange = (
    grade: (typeof GRADE_OPTIONS)[number] | ""
  ) => {
    onUpdate({
      ...unit,
      actualGrade: grade || undefined,
    });
  };

  const handleSessionChange = (session: (typeof SESSION_OPTIONS)[number]) => {
    onUpdate({
      ...unit,
      examSession: session,
    });
  };

  return (
    <div className="bg-surface-alt p-4 rounded-lg space-y-4">
      <div>
        <h4 className="font-medium text-lg">{unitName}</h4>
        <p className="text-sm text-text-muted mt-1">{unitDescription}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Status Toggles */}
        <div className="flex items-center gap-4">
          {/* Completed Toggle */}
          <button
            onClick={handleCompleteToggle}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2
              ${
                unit.completed
                  ? "bg-success/10 text-success"
                  : "bg-surface hover:bg-surface/80 text-text-muted"
              }
            `}
          >
            <svg
              className={`w-4 h-4 ${
                unit.completed ? "text-success" : "text-text-muted"
              }`}
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
            Completed
          </button>

          {/* Planned Toggle */}
          <button
            onClick={handlePlannedToggle}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2
              ${
                unit.planned
                  ? "bg-primary/10 text-primary"
                  : "bg-surface hover:bg-surface/80 text-text-muted"
              }
            `}
          >
            <svg
              className={`w-4 h-4 ${
                unit.planned ? "text-primary" : "text-text-muted"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Planned
          </button>
        </div>

        {/* Grades and Session */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target Grade */}
          <div>
            <label className="text-sm font-medium text-text-muted block mb-1">
              Target Grade
            </label>
            <select
              value={unit.targetGrade}
              onChange={(e) =>
                handleTargetGradeChange(
                  e.target.value as (typeof GRADE_OPTIONS)[number]
                )
              }
              className="
                w-full px-3 py-1.5 rounded text-sm
                bg-surface border-2 transition duration-200 outline-none
                border-border hover:border-primary/50 focus:border-primary
              "
            >
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Actual Grade (only if completed) */}
          {unit.completed && (
            <div>
              <label className="text-sm font-medium text-text-muted block mb-1">
                Actual Grade
              </label>
              <select
                value={unit.actualGrade || ""}
                onChange={(e) =>
                  handleActualGradeChange(
                    e.target.value as (typeof GRADE_OPTIONS)[number] | ""
                  )
                }
                className="
                  w-full px-3 py-1.5 rounded text-sm
                  bg-surface border-2 transition duration-200 outline-none
                  border-border hover:border-primary/50 focus:border-primary
                "
              >
                <option value="">Not Set</option>
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam Session */}
          <div>
            <label className="text-sm font-medium text-text-muted block mb-1">
              Exam Session
            </label>
            <select
              value={unit.examSession}
              onChange={(e) =>
                handleSessionChange(
                  e.target.value as (typeof SESSION_OPTIONS)[number]
                )
              }
              className="
                w-full px-3 py-1.5 rounded text-sm
                bg-surface border-2 transition duration-200 outline-none
                border-border hover:border-primary/50 focus:border-primary
              "
            >
              {SESSION_OPTIONS.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
