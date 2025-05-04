"use client";

import { useState, useEffect } from "react";
import { conversionApi } from "@/lib/api/conversion";
import { extractUnitCode } from "@/utils/unitCodes";

interface SubjectSelectorProps {
  session: string | null;
  selectedSubject: string | null;
  selectedUnit: string | null;
  onSubjectChange: (subjectId: string | null) => void;
  onUnitChange: (unitId: string | null) => void;
}

export default function SubjectSelector({
  session,
  selectedSubject,
  selectedUnit,
  onSubjectChange,
  onUnitChange,
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  interface UnitOption {
    id: string;           // "WAC11-01"
    displayCode: string;  // "WAC11"
    name: string;         // "The_Accounting_System_and_Costing"
    apiPath: string;      // "WAC11-01_-_The_Accounting_System_and_Costing"
  }
  
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subjects on component mount
  useEffect(() => {
    async function loadSubjects() {
      if (!session) {
        setSubjects([]);
        setLoading(false);
        return;
      }

      try {
        const data = await conversionApi.getSubjectsForSession(session);
        setSubjects(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load subjects");
        console.error("Error loading subjects:", err);
      }
    }
    loadSubjects();
  }, [session]);

  // Load units when subject changes
  useEffect(() => {
    async function loadUnits() {
      if (!selectedSubject || !session) {
        setUnits([]);
        return;
      }

      try {
        const data = await conversionApi.getUnitsForSubjectAndSession(selectedSubject, session);
        const transformedUnits = data.map(unit => ({
          id: unit.id,
          displayCode: unit.id.split("-")[0],
          name: unit.name,
          apiPath: `${unit.id}_-_${unit.name}`
        }));
        setUnits(transformedUnits);
      } catch (err) {
        setError("Failed to load units");
        console.error("Error loading units:", err);
      }
    }
    loadUnits();
  }, [selectedSubject, session]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse h-10 bg-surface-alt rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-text-muted text-sm p-2 bg-surface-alt rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!session ? (
        <div className="text-text-muted text-sm p-2 bg-surface-alt rounded">
          Please select a session first
        </div>
      ) : (
        <>
          {/* Subject Dropdown */}
          <div>
            <select
              value={selectedSubject || ""}
              onChange={(e) => onSubjectChange(e.target.value || null)}
              className="w-full p-2 bg-surface border border-border rounded-md
                text-text focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Dropdown */}
          {selectedSubject && (
            <div>
              <select
                value={selectedUnit || ""}
                onChange={(e) => onUnitChange(e.target.value || null)}
                className="w-full p-2 bg-surface border border-border rounded-md
                  text-text focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.apiPath} title={unit.name}>
                    {unit.displayCode}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}