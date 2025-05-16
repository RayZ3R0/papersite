"use client";

import { UserSubjectConfig } from "@/types/profile";
import { SubjectsData } from "@/types/subject";
import subjectsData from "@/lib/data/subjects.json";

interface ProfileStatsProps {
  subjects: UserSubjectConfig[];
  studyPreferences?: {
    dailyStudyHours?: number;
    preferredStudyTime?: "morning" | "afternoon" | "evening" | "night";
  };
}

const subjectsList = (subjectsData as SubjectsData).subjects;

export default function ProfileStats({
  subjects,
  studyPreferences,
}: ProfileStatsProps) {
  const totalUnits = subjects.reduce(
    (acc, subject) => acc + subject.units.length,
    0
  );

  const totalSubjects = subjects.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-surface rounded-lg">
        <h3 className="text-sm text-text-muted mb-2">Total Units</h3>
        <p className="text-2xl font-semibold">{totalUnits}</p>
        <div className="mt-1 text-sm text-text-muted">
          {totalUnits === 0
            ? "No units selected"
            : `${totalUnits} unit${
                totalUnits !== 1 ? "s" : ""
              } across ${totalSubjects} subject${
                totalSubjects !== 1 ? "s" : ""
              }`}
        </div>
      </div>

      <div className="p-4 bg-surface rounded-lg">
        <h3 className="text-sm text-text-muted mb-2">Study Goals</h3>
        <p className="text-2xl font-semibold">
          {studyPreferences?.dailyStudyHours || 0}
          <span className="text-base font-normal text-text-muted">
            {" "}
            hrs/day
          </span>
        </p>
        <div className="mt-1 text-sm text-text-muted capitalize">
          {studyPreferences?.preferredStudyTime
            ? `Preferred: ${studyPreferences.preferredStudyTime}`
            : "No study schedule set"}
        </div>
      </div>
    </div>
  );
}
