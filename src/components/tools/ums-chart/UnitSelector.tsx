"use client";

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { Unit } from "@/types/ums"; // Adjust the import path if needed

interface UnitSelectorProps {
  units: Unit[];
  selectedUnit: Unit | undefined;
  onUnitChange: (unit: Unit) => void;
  loading: boolean;
  disabled?: boolean;
}

export default function UnitSelector({
  units,
  selectedUnit,
  onUnitChange,
  loading,
  disabled = false
}: UnitSelectorProps) {
  // Format unit options for dropdown
  const unitOptions = units.map(unit => ({
    value: unit.id,
    label: unit.code || unit.id,
    description: unit.name 
  }));

  // Handle unit selection
  const handleUnitSelect = (value: string | null) => {
    if (!value) return;
    
    const unit = units.find(u => u.id === value);
    if (unit) {
      onUnitChange(unit);
    }
  };

  return (
    <CustomDropdown
      options={unitOptions}
      value={selectedUnit?.id || null}
      onChange={handleUnitSelect}
      placeholder="Select a unit"
      emptyMessage={disabled ? "Select a subject first" : "No units available"}
      icon={<DocumentTextIcon className="h-5 w-5" />}
      isLoading={loading}
    />
  );
}