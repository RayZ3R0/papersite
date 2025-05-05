"use client";

import { useMemo } from "react";
import { ConversionData, ConversionRecord } from "@/types/conversion";
import GradeBoundaryChart from "./chart";

interface GradeBoundariesProps {
  conversionData: ConversionData | null;
  loading?: boolean;
}

interface GradeBoundary {
  grade: string;
  raw: number;
  ums: number;
  lowerBound: number;
}

interface GradeStyle {
  bgColor: string;
  hoverBgColor: string;
  textColor: string;
  label: string;
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

    // Sort data by RAW marks in descending order
    const sortedData = [...conversionData.data].sort((a, b) => b.RAW - a.RAW);
    
    // Use a Map to prevent duplicate grades
    const boundaries = new Map<string, GradeBoundary>();
    
    // Group data by grade
    const gradeGroups: Record<string, ConversionRecord[]> = {};
    conversionData.data.forEach(record => {
      if (!record.GRADE) return;
      
      if (!gradeGroups[record.GRADE]) {
        gradeGroups[record.GRADE] = [];
      }
      gradeGroups[record.GRADE].push(record);
    });

    // Find Full UMS boundary (minimum marks needed for max UMS)
    const maxUmsEntries = sortedData.filter(entry => entry.UMS === maxUms);
    if (maxUmsEntries.length > 0) {
      const minFullUmsRaw = Math.min(...maxUmsEntries.map(entry => entry.RAW));
      boundaries.set('Full UMS', {
        grade: 'Full UMS',
        raw: minFullUmsRaw,
        ums: maxUms,
        lowerBound: minFullUmsRaw
      });
    }

    // Process each grade to find the minimum raw mark required
    Object.entries(gradeGroups).forEach(([grade, records]) => {
      if (!records.length) return;

      if(grade === '*') grade = "A*"; 
      
      // Find the minimum raw mark for this grade
      const minRawForGrade = Math.min(...records.map(record => record.RAW));
      const umsForMinRaw = records.find(record => record.RAW === minRawForGrade)?.UMS || 0;
      
      boundaries.set(grade, {
        grade,
        raw: minRawForGrade,
        ums: umsForMinRaw,
        lowerBound: minRawForGrade
      });
    });

    // Convert to array and preserve the sort order from original code
    const sortedBoundaries = Array.from(boundaries.values()).sort((a, b) => {
      if (a.grade === 'Full UMS') return -1;
      if (b.grade === 'Full UMS') return 1;
      if (a.grade === 'A*') return -1;
      if (b.grade === 'A*') return 1;
      // For other grades, sort by raw mark in descending order
      return b.raw - a.raw;
    });

    return {
      gradeBoundaries: sortedBoundaries,
      maxRaw,
      maxUms
    };
  }, [conversionData]);

  // Helper function to get color styles based on grade
  const getGradeStyle = (grade: string): GradeStyle => {
    switch (grade) {
      case 'Full UMS':
        return {
          bgColor: '#9333EA', // Purple
          hoverBgColor: '#A855F7',
          textColor: '#9333EA',
          label: 'Full UMS'
        };
      case 'A*':
        return {
          bgColor: '#3B82F6', // Blue
          hoverBgColor: '#60A5FA',
          textColor: '#3B82F6',
          label: 'Grade A*'
        };
      case 'A':
        return {
          bgColor: '#10B981', // Green
          hoverBgColor: '#34D399',
          textColor: '#10B981',
          label: 'Grade A'
        };
      case 'B':
        return {
          bgColor: '#06B6D4', // Cyan
          hoverBgColor: '#22D3EE',
          textColor: '#06B6D4',
          label: 'Grade B'
        };
      case 'C':
        return {
          bgColor: '#F59E0B', // Amber
          hoverBgColor: '#FBBF24',
          textColor: '#F59E0B',
          label: 'Grade C'
        };
      case 'D':
        return {
          bgColor: '#EA580C', // Darker orange
          hoverBgColor: '#F97316',
          textColor: '#9A3412',
          label: 'Grade D'
        };
      case 'E':
        return {
          bgColor: '#B91C1C', // Darker red
          hoverBgColor: '#DC2626',
          textColor: '#B91C1C',
          label: 'Grade E'
        };
      case 'U':
        return {
          bgColor: '#6B7280', // Gray
          hoverBgColor: '#9CA3AF',
          textColor: '#6B7280',
          label: 'Grade U'
        };
      default:
        return {
          bgColor: '#6B7280', // Gray
          hoverBgColor: '#9CA3AF',
          textColor: '#6B7280',
          label: `Grade ${grade}`
        };
    }
  };

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
            {gradeBoundaries.map((boundary) => {
              const gradeStyle = getGradeStyle(boundary.grade);
              return (
                <tr
                  key={boundary.grade}
                  className="hover:bg-surface-alt transition-colors"
                  style={{
                    backgroundColor: boundary.grade === 'Full UMS' ? 'rgba(147, 51, 234, 0.05)' : undefined
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-medium text-text">
                      {boundary.grade === 'Full UMS' ? 'Full UMS' : boundary.grade}
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
      <GradeBoundaryChart conversionData={conversionData} loading={loading} />
    </div>
  );
}