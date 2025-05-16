"use client";

import { UserSubjectConfig } from "@/types/profile";
import UnitCard from "./UnitCard";

const GRADE_OPTIONS = ["A*", "A", "B", "C", "D", "E"] as const;

interface UnitEditorProps {
  subject: UserSubjectConfig;
  onUpdate: (updatedSubject: UserSubjectConfig) => void;
}

export default function UnitEditor({ subject, onUpdate }: UnitEditorProps) {
  const handleUnitChange = (
    index: number,
    updatedUnit: (typeof subject.units)[0]
  ) => {
    const newUnits = [...subject.units];
    newUnits[index] = updatedUnit;

    onUpdate({
      ...subject,
      units: newUnits,
    });
  };

  const handleGradeChange = (grade: (typeof GRADE_OPTIONS)[number]) => {
    onUpdate({
      ...subject,
      overallTarget: grade,
      units: subject.units.map((unit) => ({
        ...unit,
        targetGrade:
          unit.targetGrade === subject.overallTarget ? grade : unit.targetGrade,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Target Grade */}
      <div>
        <label className="text-sm font-medium text-text-muted block mb-2">
          Overall Target Grade
        </label>
        <select
          value={subject.overallTarget}
          onChange={(e) =>
            handleGradeChange(e.target.value as (typeof GRADE_OPTIONS)[number])
          }
          className="
            px-3 py-1.5 rounded text-sm w-24
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

      {/* Units List */}
      <div className="space-y-4">
        {subject.units.map((unit, index) => (
          <UnitCard
            key={unit.unitCode}
            unit={unit}
            unitName={`Unit ${unit.unitCode}`}
            unitDescription="Unit description will go here"
            onUpdate={(updatedUnit) => handleUnitChange(index, updatedUnit)}
          />
        ))}
      </div>
    </div>
  );
}
