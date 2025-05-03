"use client";

import { useMemo } from "react";
import { ConversionData, ConversionRecord } from "@/types/conversion";

interface GradeBoundariesProps {
  conversionData: ConversionData | null;
  loading?: boolean;
}

interface GradeBoundary {
  grade: string;
  raw: number;
  ums: number;
}

export default function GradeBoundaries({
  conversionData,
  loading = false,
}: GradeBoundariesProps) {
  // Extract grade boundaries from conversion data
  const boundaries = useMemo(() => {
    if (!conversionData) return [];

    const sortedData = [...conversionData.data].sort((a, b) => b.RAW - a.RAW);
    const boundaries: GradeBoundary[] = [];
    const processedGrades = new Set<string>();

    // Find the highest RAW mark for each grade
    sortedData.forEach((record) => {
      if (
        record.GRADE !== "Max Mark" &&
        !processedGrades.has(record.GRADE)
      ) {
        boundaries.push({
          grade: record.GRADE,
          raw: record.RAW,
          ums: record.UMS,
        });
        processedGrades.add(record.GRADE);
      }
    });

    // Add "U" grade with 0 marks if not present
    if (!processedGrades.has("U")) {
      boundaries.push({
        grade: "U",
        raw: 0,
        ums: 0,
      });
    }

    return boundaries.sort((a, b) => b.raw - a.raw);
  }, [conversionData]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-surface-alt rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-surface-alt rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversionData) {
    return (
      <div className="text-center p-8 bg-surface rounded-lg border border-border">
        <h3 className="text-lg font-medium text-text mb-2">No Data Available</h3>
        <p className="text-text-muted">
          Please select a subject, unit, and session to view grade boundaries.
        </p>
      </div>
    );
  }

  const maxRaw = conversionData.data[0]?.RAW || 100;
  const maxUms = conversionData.data[0]?.UMS || 100;

  return (
    <div className="space-y-6">
      {/* Grade Boundaries Table */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-surface">
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Raw Mark
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                UMS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {boundaries.map((boundary, index) => (
              <tr
                key={boundary.grade}
                className="hover:bg-surface-alt transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-medium text-text">
                    {boundary.grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text">
                  {boundary.raw}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text">
                  {boundary.ums}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text">
                  {Math.round((boundary.raw / maxRaw) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Representation */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium text-text mb-4">
          Grade Distribution
        </h3>
        <div className="space-y-4">
          {boundaries.map((boundary, index) => {
            const nextBoundary = boundaries[index + 1];
            const range = nextBoundary
              ? boundary.raw - nextBoundary.raw
              : boundary.raw;
            const percentage = (boundary.raw / maxRaw) * 100;

            return (
              <div key={boundary.grade} className="space-y-2">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Grade {boundary.grade}</span>
                  <span>{boundary.raw} marks</span>
                </div>
                <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-sm text-text-muted">
        <div>Maximum Raw Mark: {maxRaw}</div>
        <div>Maximum UMS: {maxUms}</div>
        <div>Session: {conversionData.metadata.session}</div>
      </div>
    </div>
  );
}