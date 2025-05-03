"use client";

import { useState, useMemo } from "react";
import { ConversionData, ConversionRecord } from "@/types/conversion";

interface ConversionTableProps {
  conversionData: ConversionData | null;
  loading?: boolean;
}

export default function ConversionTable({
  conversionData,
  loading = false,
}: ConversionTableProps) {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string | "all">("all");

  // Get unique grades from data
  const grades = useMemo(() => {
    if (!conversionData) return [];
    const gradeSet = new Set<string>();
    conversionData.data.forEach((record) => {
      if (record.GRADE !== "Max Mark") {
        gradeSet.add(record.GRADE);
      }
    });
    return Array.from(gradeSet).sort();
  }, [conversionData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!conversionData) return [];

    return conversionData.data
      .filter((record) => {
        if (gradeFilter !== "all" && record.GRADE !== gradeFilter) return false;
        if (search) {
          const searchStr = search.toLowerCase();
          return (
            record.RAW.toString().includes(searchStr) ||
            record.UMS.toString().includes(searchStr) ||
            record.GRADE.toLowerCase().includes(searchStr)
          );
        }
        return true;
      })
      .sort((a, b) => b.RAW - a.RAW);
  }, [conversionData, search, gradeFilter]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-surface-alt rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-surface-alt rounded"></div>
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
          Please select a subject, unit, and session to view conversion table.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search marks or grades..."
            className="w-full p-2 bg-surface border border-border rounded-md
              text-text focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Filter by Grade
          </label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full p-2 bg-surface border border-border rounded-md
              text-text focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Raw Mark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  UMS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((record, idx) => (
                  <tr
                    key={`${record.RAW}-${idx}`}
                    className="hover:bg-surface-alt transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-text">
                      {record.RAW}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text">
                      {record.UMS}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text">
                      {record.GRADE}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-text-muted"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-text-muted">
        Showing {filteredData.length} of {conversionData.data.length} entries
      </div>
    </div>
  );
}