"use client";

import { useMemo } from "react";
import { ConversionData } from "@/types/conversion";

interface GradeBoundaryChartProps {
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

export default function GradeBoundaryChart({
  conversionData,
  loading = false,
}: GradeBoundaryChartProps) {
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
    
    const boundaries = new Map<string, GradeBoundary>();

    // Find Full UMS boundary (marks needed for max UMS)
    const maxUmsEntries = sortedData.filter(entry => entry.UMS === maxUms);
    const minFullUmsRaw = Math.min(...maxUmsEntries.map(entry => entry.RAW));
    boundaries.set('Full UMS', {
      grade: 'Full UMS',
      raw: maxRaw,
      ums: maxUms,
      lowerBound: minFullUmsRaw
    });

    // Check if dataset has A* grade
    const hasAStarGrade = sortedData.some(entry => entry.GRADE === "*");

    // Find A* boundary if it exists
    if (hasAStarGrade) {
      const aStarEntry = sortedData.find(entry => entry.GRADE === "*" && entry.RAW < minFullUmsRaw);
      if (aStarEntry) {
        boundaries.set('A*', {
          grade: 'A*',
          raw: minFullUmsRaw - 1,
          ums: aStarEntry.UMS,
          lowerBound: aStarEntry.RAW
        });
      }
    }

    // Find other grade boundaries
    const grades = ['A', 'B', 'C', 'D', 'E', 'U'];
    // Start from maxRaw or A* boundary depending on what we have
    let lastBoundary = hasAStarGrade ? 
      sortedData.find(entry => entry.GRADE === "*")?.RAW ?? (minFullUmsRaw - 1) : 
      minFullUmsRaw - 1;

    grades.forEach(grade => {
      // Find first entry with this grade
      const entry = sortedData.find(e => e.GRADE === grade);
      if (entry) {
        // Find the lowest raw mark for this grade
        const lowestMarkForGrade = Math.min(
          ...sortedData
            .filter(e => e.GRADE === grade)
            .map(e => e.RAW)
        );
        
        boundaries.set(grade, {
          grade,
          raw: grade === 'A' && !hasAStarGrade ? lastBoundary : entry.RAW,
          ums: entry.UMS,
          lowerBound: lowestMarkForGrade
        });
        
        // Update lastBoundary for next iteration
        lastBoundary = lowestMarkForGrade - 1;
      }
    });

    // Convert to array and sort:
    // Full UMS first, then A*, then other grades by descending RAW marks
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

  // Calculate the correct range for each grade
  const getGradeRangeInfo = (boundaries: GradeBoundary[], index: number) => {
    const boundary = boundaries[index];
    let lowerBound = 0;
    
    // Find the next lower boundary
    if (index < boundaries.length - 1) {
      lowerBound = boundaries[index + 1].raw + 1;
    } else if (boundary.grade !== 'U') {
      // For the lowest grade that's not U, set the lower bound to 1
      lowerBound = 1;
    }
    
    return {
      upperBound: boundary.raw,
      lowerBound: lowerBound
    };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-surface-alt rounded"></div>
        <div className="h-8 bg-surface-alt rounded mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-surface-alt rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversionData) {
    return (
      <div className="text-center p-8 bg-surface rounded-lg border border-border">
        <h3 className="text-lg font-medium text-text mb-2">No Chart Data Available</h3>
        <p className="text-text-muted">
          Please select a subject, unit, and session to view grade distribution.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text">Grade Distribution</h3>
        </div>
        
        {/* Stacked Progress Bar */}
        <div className="mb-6">
          <div className="h-8 rounded-lg overflow-hidden flex">
            {gradeBoundaries.map((boundary, index) => {
              // Calculate the correct range and percentage
              const { lowerBound, upperBound } = getGradeRangeInfo(gradeBoundaries, index);
              const range = upperBound - lowerBound + 1;
              const percentage = (range / maxRaw) * 100;
              const gradeStyle = getGradeStyle(boundary.grade);
              
              return (
                <div
                  key={boundary.grade}
                  className="relative h-full group cursor-pointer transition-all"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: gradeStyle.bgColor 
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = gradeStyle.hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = gradeStyle.bgColor;
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute invisible group-hover:visible bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground rounded shadow-lg whitespace-nowrap text-sm z-10">
                    <div className="font-medium">
                      {gradeStyle.label}
                    </div>
                    <div className="text-xs opacity-80">
                      {lowerBound} - {upperBound} marks ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gradeBoundaries.map((boundary, index) => {
            const { lowerBound, upperBound } = getGradeRangeInfo(gradeBoundaries, index);
            const gradeStyle = getGradeStyle(boundary.grade);

            return (
              <div key={boundary.grade} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: gradeStyle.bgColor }}
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: gradeStyle.textColor }}>
                    {gradeStyle.label}
                  </div>
                  <div className="text-xs text-text-muted">
                    {lowerBound} - {upperBound} marks
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Metadata now at the bottom */}
      <div className="mt-4 text-sm text-text-muted">
        <div>Maximum Raw Mark: {maxRaw}</div>
        <div>Maximum UMS: {maxUms}</div>
        <div>Session: {conversionData.metadata.session}</div>
        <div>Subject: {conversionData.metadata.subject}</div>
        <div>Unit: {conversionData.metadata.unit.split('\n')[0]}</div>
      </div>
    </>
  );
}