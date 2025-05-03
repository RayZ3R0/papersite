"use client";

import { useState, useEffect } from "react";
import { conversionApi } from "@/lib/api/conversion";

interface SubjectSelectorProps {
  selectedSubject: string | null;
  selectedUnit: string | null;
  onSubjectChange: (subjectId: string | null) => void;
  onUnitChange: (unitId: string | null) => void;
}

export default function SubjectSelector({
  selectedSubject,
  selectedUnit,
  onSubjectChange,
  onUnitChange,
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subjects on component mount
  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await conversionApi.getSubjects();
        setSubjects(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load subjects");
        console.error("Error loading subjects:", err);
      }
    }
    loadSubjects();
  }, []);

  // Load units when subject changes
  useEffect(() => {
    async function loadUnits() {
      if (!selectedSubject) {
        setUnits([]);
        return;
      }

      try {
        const data = await conversionApi.getUnitsForSubject(selectedSubject);
        setUnits(data);
      } catch (err) {
        setError("Failed to load units");
        console.error("Error loading units:", err);
      }
    }
    loadUnits();
  }, [selectedSubject]);

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
            <option key={subject} value={subject.toLowerCase()}>
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
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}