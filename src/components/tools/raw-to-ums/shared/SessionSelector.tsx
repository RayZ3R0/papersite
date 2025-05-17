"use client";

import { useState, useEffect } from "react";
import { conversionApi } from "@/lib/api/conversion";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface SessionSelectorProps {
  selectedSession: string | null;
  onSessionChange: (session: string | null) => void;
}

export default function SessionSelector({
  selectedSession,
  onSessionChange,
}: SessionSelectorProps) {
  const [sessions, setSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all available sessions on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await conversionApi.getSessions();
        setSessions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load sessions");
        console.error("Error loading sessions:", err);
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (error) {
    return (
      <div className="text-text-muted text-sm p-2 bg-surface-alt rounded">
        {error}
      </div>
    );
  }

  // Sort sessions in reverse chronological order
  const sortedSessions = [...sessions].sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    
    // First sort by year in descending order
    if (yearA !== yearB) {
      return parseInt(yearB) - parseInt(yearA);
    }
    
    // For same year, sort by month in descending order (most recent first)
    const monthOrder: Record<string, number> = {
      // January (0), June (1), October (2)
      "January": 0,
      "June": 1, 
      "May": 1,  // Treat May same as June
      "October": 2
    };
    
    // Compare month order values - higher value = earlier in year
    return monthOrder[monthB] - monthOrder[monthA];
  });

  // Format options for the dropdown
  const sessionOptions = sortedSessions.map(session => {
    const [month, year] = session.split(" ");
    return {
      value: session,
      label: session,
      description: `${month} Examination Series`
    };
  });

  return (
    <CustomDropdown
      options={sessionOptions}
      value={selectedSession}
      onChange={onSessionChange}
      placeholder="Select Session"
      emptyMessage="No sessions available"
      icon={<CalendarIcon className="h-5 w-5" />}
      isLoading={loading}
    />
  );
}