"use client";

import UMSChart from "@/components/tools/ums-chart";
import { Subject, Unit, UMSData } from "@/types/ums";
import { useCallback, useEffect, useState } from "react";

export default function UMSChartPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject>();
  const [selectedUnit, setSelectedUnit] = useState<Unit>();
  const [umsData, setUMSData] = useState<UMSData>();
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  // Fetch available subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://papervoid-api-rgic.shuttle.app/api/ums/subjects');
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data);
        setError(undefined);
      } catch (err) {
        setError('Failed to load subjects. Please try again.');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Fetch available units when subject is selected
  const handleSubjectSelect = async (subject: Subject) => {
    setLoading(true);
    setSelectedSubject(subject);
    setSelectedUnit(undefined);
    setUMSData(undefined);
    
    try {
      const response = await fetch(
        `https://papervoid-api-rgic.shuttle.app/api/ums/subjects/${subject.id}/units`
      );
      if (!response.ok) throw new Error("Failed to fetch units");
      
      const units: Unit[] = await response.json();
      setAvailableUnits(units);
      setError(undefined);
    } catch (err) {
      setError("Failed to load units. Please try again.");
      setAvailableUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch UMS data when unit is selected
  const handleUnitSelect = useCallback(async (unit: Unit) => {
    if (!selectedSubject) return;
    
    setLoading(true);
    setSelectedUnit(unit);
    setUMSData(undefined);

    try {
      const response = await fetch(
        `https://papervoid-api-rgic.shuttle.app/api/ums/subjects/${selectedSubject.id}/units/${unit.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch UMS data");
      
      const data: UMSData = await response.json();
      setUMSData(data);
      setError(undefined);
    } catch (err) {
      setError("Failed to load UMS data. Please try again.");
      setUMSData(undefined);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="prose dark:prose-invert">
        <h1>UMS Conversion Charts</h1>
        <p>
          Compare how Raw to UMS conversion patterns change across different examination sessions.
        </p>
      </div>

      {/* Selection Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Subject
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg bg-surface border border-border"
            onChange={(e) => {
              const subject = JSON.parse(e.target.value) as Subject;
              handleSubjectSelect(subject);
            }}
            value={selectedSubject ? JSON.stringify(selectedSubject) : ""}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={JSON.stringify(subject)}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Selection */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Unit
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg bg-surface border border-border"
            onChange={(e) => {
              const unit = JSON.parse(e.target.value) as Unit;
              handleUnitSelect(unit);
            }}
            value={selectedUnit ? JSON.stringify(selectedUnit) : ""}
            disabled={!selectedSubject || availableUnits.length === 0}
          >
            <option value="">
              {selectedSubject
                ? "Select a unit"
                : "Please select a subject first"}
            </option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={JSON.stringify(unit)}>
                {unit.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Chart */}
      <UMSChart
        subject={selectedSubject}
        unit={selectedUnit}
        umsData={umsData}
        loading={loading}
      />
    </div>
  );
}