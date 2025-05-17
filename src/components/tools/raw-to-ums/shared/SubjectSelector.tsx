"use client";

import { useState, useEffect } from "react";
import { conversionApi } from "@/lib/api/conversion";
import { extractUnitCode } from "@/utils/unitCodes";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { BookOpenIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

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
  const [loadingUnits, setLoadingUnits] = useState(false);
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
        setLoading(true);
        const data = await conversionApi.getSubjectsForSession(session);
        setSubjects(data);
      } catch (err) {
        setError("Failed to load subjects");
        console.error("Error loading subjects:", err);
      } finally {
        setLoading(false);
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
        setLoadingUnits(true);
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
      } finally {
        setLoadingUnits(false);
      }
    }
    loadUnits();
  }, [selectedSubject, session]);

  // Format subject options
  const subjectOptions = subjects.map(subject => ({
    value: subject,
    label: subject,
  }));

  // Format unit options
  const unitOptions = units.map(unit => ({
    value: unit.apiPath,
    label: unit.displayCode,
    description: unit.name.replace(/_/g, ' ')
  }));

  return (
    <div className="space-y-4">
      {!session ? (
        <div className="text-text-muted text-sm p-2 bg-surface-alt rounded">
          Please select a session first
        </div>
      ) : (
        <>
          {/* Subject Dropdown */}
          <CustomDropdown
            options={subjectOptions}
            value={selectedSubject}
            onChange={onSubjectChange}
            placeholder="Select Subject"
            emptyMessage="No subjects available for this session"
            icon={<BookOpenIcon className="h-5 w-5" />}
            isLoading={loading}
          />

          {/* Unit Dropdown */}
          {selectedSubject && (
            <CustomDropdown
              options={unitOptions}
              value={selectedUnit}
              onChange={onUnitChange}
              placeholder="Select Unit"
              emptyMessage="No units available for this subject"
              icon={<DocumentTextIcon className="h-5 w-5" />}
              isLoading={loadingUnits}
            />
          )}
        </>
      )}
    </div>
  );
}