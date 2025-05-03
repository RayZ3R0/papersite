"use client";

import { useState, useEffect, useMemo } from "react";
import { ConversionData } from "@/types/conversion";

interface QuickConverterProps {
  conversionData: ConversionData | null;
  loading?: boolean;
}

export default function QuickConverter({
  conversionData,
  loading = false,
}: QuickConverterProps) {
  const [rawMark, setRawMark] = useState<string>("");
  const maxRaw = conversionData?.data[0]?.RAW || 100;

  // Calculate result whenever raw mark changes
  const result = useMemo(() => {
    if (!conversionData || !rawMark) return null;

    const raw = parseInt(rawMark);
    if (isNaN(raw) || raw < 0 || raw > maxRaw) return null;

    // Find the matching conversion record
    const record = conversionData.data.find((r) => r.RAW === raw);
    
    if (record) {
      return {
        ums: record.UMS,
        grade: record.GRADE,
      };
    }

    // Interpolate between closest values
    const sortedData = [...conversionData.data]
      .sort((a, b) => a.RAW - b.RAW);
    
    const lower = sortedData.find(r => r.RAW < raw);
    const higher = sortedData.find(r => r.RAW > raw);

    if (lower && higher) {
      // Linear interpolation
      const ratio = (raw - lower.RAW) / (higher.RAW - lower.RAW);
      return {
        ums: Math.round(lower.UMS + ratio * (higher.UMS - lower.UMS)),
        grade: higher.GRADE, // Use the higher grade for safety
      };
    }

    return null;
  }, [conversionData, rawMark, maxRaw]);

  // Reset input when conversion data changes
  useEffect(() => {
    setRawMark("");
  }, [conversionData]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-surface-alt rounded w-1/3"></div>
        <div className="h-24 bg-surface-alt rounded"></div>
      </div>
    );
  }

  if (!conversionData) {
    return (
      <div className="text-center p-8 bg-surface rounded-lg border border-border">
        <h3 className="text-lg font-medium text-text mb-2">No Data Available</h3>
        <p className="text-text-muted">
          Please select a subject, unit, and session to start converting marks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <label className="block text-sm font-medium text-text-muted mb-2">
          Enter Raw Mark
        </label>
        <input
          type="number"
          value={rawMark}
          onChange={(e) => setRawMark(e.target.value)}
          min="0"
          max={maxRaw}
          className="w-full p-3 bg-surface border border-border rounded-md
            text-text focus:ring-2 focus:ring-primary/20 text-lg"
          placeholder={`Enter mark (0-${maxRaw})`}
        />
      </div>

      {/* Result Section */}
      {result && (
        <div className="bg-surface rounded-lg border border-border p-6 animate-fadeIn">
          <h3 className="text-lg font-medium text-text mb-4">Result</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-alt rounded-lg text-center">
              <div className="text-text-muted text-sm mb-1">UMS Mark</div>
              <div className="text-3xl font-bold text-text">{result.ums}</div>
            </div>
            <div className="p-4 bg-surface-alt rounded-lg text-center">
              <div className="text-text-muted text-sm mb-1">Grade</div>
              <div className="text-3xl font-bold text-text">{result.grade}</div>
            </div>
          </div>
        </div>
      )}

      {/* Input Guide */}
      {!result && rawMark && (
        <div className="text-sm text-text-muted text-center animate-fadeIn">
          Please enter a valid mark between 0 and {maxRaw}
        </div>
      )}

      {/* Metadata Display */}
      <div className="text-sm text-text-muted">
        <div>Subject: {conversionData.metadata.subject}</div>
        <div>Unit: {conversionData.metadata.unit}</div>
        <div>Session: {conversionData.metadata.session}</div>
      </div>
    </div>
  );
}