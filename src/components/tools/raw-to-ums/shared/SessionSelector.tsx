"use client";

import { useState, useEffect } from "react";
import { conversionApi } from "@/lib/api/conversion";

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

  if (loading) {
    return (
      <div className="animate-pulse h-10 bg-surface-alt rounded" />
    );
  }

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
    
    if (yearA !== yearB) {
      return parseInt(yearB) - parseInt(yearA);
    }
    
    // Month order: January (0), May/June (1), October (2)
    const monthOrder: Record<string, number> = {
      January: 0,
      May: 1,
      June: 1,
      October: 2,
    };
    
    return (monthOrder[monthA] || 0) - (monthOrder[monthB] || 0);
  });

  return (
    <select
      value={selectedSession || ""}
      onChange={(e) => onSessionChange(e.target.value || null)}
      className="w-full p-2 bg-surface border border-border rounded-md
        text-text focus:ring-2 focus:ring-primary/20"
    >
      <option value="">Select Session</option>
      {sortedSessions.map((session) => (
        <option key={session} value={session}>
          {session}
        </option>
      ))}
    </select>
  );
}