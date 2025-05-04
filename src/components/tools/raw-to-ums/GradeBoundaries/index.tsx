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
  // Calculate minimum marks required for each grade
  const { gradeBoundaries, maxRaw, maxUms } = useMemo(() => {
    if (!conversionData) return {
      gradeBoundaries: [],
      maxRaw: 0,
      maxUms: 0
    };

    const maxRaw = Math.max(...conversionData.data.map(entry => entry.RAW));
    const maxUms = Math.max(...conversionData.data.map(entry => entry.UMS));

    const boundaries = new Map<string, GradeBoundary>();
    
    // Find all entries that achieve maximum UMS score
    const maxUmsMarks = conversionData.data
      .filter(entry => entry.UMS >= maxUms)
      .map(entry => entry.RAW);
      
    if (maxUmsMarks.length > 0) {
      // For Full UMS, use the minimum RAW mark that achieves maximum UMS
      const minFullUmsRaw = Math.min(...maxUmsMarks);
      boundaries.set('Full UMS', {
        grade: 'Full UMS',
        raw: minFullUmsRaw,
        ums: maxUms
      });
    }

    // Then add regular grade boundaries
    conversionData.data.forEach(entry => {
      if (entry.GRADE === "*") return; // Skip Full UMS entries
      
      if (!boundaries.has(entry.GRADE) || entry.RAW < boundaries.get(entry.GRADE)!.raw) {
        boundaries.set(entry.GRADE, {
          grade: entry.GRADE,
          raw: entry.RAW,
          ums: entry.UMS
        });
      }
    });

    // Add "U" grade with 0 marks if not present
    if (!boundaries.has("U")) {
      boundaries.set("U", {
        grade: "U",
        raw: 0,
        ums: 0
      });
    }

    // Convert to array and sort:
    // Full UMS first, then other grades by descending RAW marks
    const sortedBoundaries = Array.from(boundaries.values()).sort((a, b) => {
      if (a.grade === 'Full UMS') return -1;
      if (b.grade === 'Full UMS') return 1;
      return b.raw - a.raw;
    });

    return {
      gradeBoundaries: sortedBoundaries,
      maxRaw,
      maxUms
    };
  }, [conversionData]);

  // Calculate maximum marks achieved for each grade (for progress bars)
  const gradeDistribution = useMemo(() => {
    if (!conversionData) return new Map<string, number>();

    const distribution = new Map<string, number>();
    
    // First handle Full UMS entries
    const maxUmsMarks = conversionData.data
      .filter(entry => entry.UMS >= maxUms)
      .map(entry => entry.RAW);

    if (maxUmsMarks.length > 0) {
      distribution.set('Full UMS', Math.max(...maxUmsMarks));
    }
    
    // Then handle regular grades
    conversionData.data.forEach(entry => {
      if (entry.GRADE === "*") return; // Skip Full UMS entries
      
      if (!distribution.has(entry.GRADE) || entry.RAW > distribution.get(entry.GRADE)!) {
        distribution.set(entry.GRADE, entry.RAW);
      }
    });

    return distribution;
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
            {gradeBoundaries.map((boundary, index) => {
              const isFullUms = boundary.grade === 'Full UMS';
              return (
                <tr
                  key={boundary.grade}
                  className={`hover:bg-surface-alt transition-colors ${
                    isFullUms ? 'bg-surface-highlight font-medium' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-medium ${isFullUms ? 'text-accent' : 'text-text'}`}>
                      {isFullUms ? 'Full UMS' : boundary.grade}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual Representation */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text">Grade Distribution</h3>
          <div className="text-sm text-text-muted">
            * Full UMS indicates minimum marks needed for maximum UMS score
          </div>
        </div>
        <div className="space-y-4">
          {gradeBoundaries.map((boundary, index) => {
            const nextBoundary = gradeBoundaries[index + 1];
            const range = nextBoundary
              ? boundary.raw - nextBoundary.raw
              : boundary.raw;
            // Use gradeDistribution for progress bar width
            const maxGradeRaw = gradeDistribution.get(boundary.grade) || boundary.raw;
            const percentage = (maxGradeRaw / maxRaw) * 100;
            
            const isFullUms = boundary.grade === 'Full UMS';

            return (
              <div key={boundary.grade} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className={`${isFullUms ? 'text-accent font-medium' : 'text-text-muted'}`}>
                    {isFullUms ? 'Full UMS*' : `Grade ${boundary.grade}`}
                  </span>
                  <span className={`${isFullUms ? 'text-accent font-medium' : 'text-text-muted'}`}>
                    {boundary.raw} marks
                  </span>
                </div>
                <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isFullUms ? 'bg-accent' : 'bg-primary'} rounded-full transition-all`}
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