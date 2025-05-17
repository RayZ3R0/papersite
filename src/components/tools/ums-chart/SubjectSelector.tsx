"use client";

import { useState } from "react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { Subject } from "@/types/ums"; // Adjust the import path if needed

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubject: Subject | undefined;
  onSubjectChange: (subject: Subject) => void;
  loading: boolean;
  disabled?: boolean;
}

export default function SubjectSelector({
  subjects,
  selectedSubject,
  onSubjectChange,
  loading,
  disabled = false
}: SubjectSelectorProps) {
  // Format subject options for dropdown
  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: subject.name,
    description: subject.description || `ID: ${subject.id}`
  }));

  // Handle subject selection
  const handleSubjectSelect = (value: string | null) => {
    if (!value) return;
    
    const subject = subjects.find(s => s.id === value);
    if (subject) {
      onSubjectChange(subject);
    }
  };

  return (
    <CustomDropdown
      options={subjectOptions}
      value={selectedSubject?.id || null}
      onChange={handleSubjectSelect}
      placeholder="Select a subject"
      emptyMessage="No subjects available"
      icon={<BookOpenIcon className="h-5 w-5" />}
      isLoading={loading}
    />
  );
}